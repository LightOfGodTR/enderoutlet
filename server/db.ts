// Import different database drivers based on environment
import ws from "ws";
import * as schema from "@shared/schema";
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';

// Validate DATABASE_URL is provided - fail fast if missing
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required. Please set it in your environment or .env file."
  );
}

// Environment detection for driver selection
const isReplit = process.env.REPL_ID !== undefined || process.env.REPL_SLUG !== undefined;
const isDocker = process.env.DATABASE_URL?.includes('@database:') || process.env.DOCKER === 'true';
const isNeonDatabase = process.env.DATABASE_URL?.includes('neon.') || process.env.DATABASE_URL?.includes('ep-');
const isProduction = process.env.NODE_ENV === 'production';

// Advanced connection pool configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings optimized based on environment
  max: parseInt(process.env.DB_POOL_MAX || (isReplit ? '3' : '10')), 
  min: parseInt(process.env.DB_POOL_MIN || (isReplit ? '1' : '2')), 
  maxUses: parseInt(process.env.DB_POOL_MAX_USES || '1000'), 
  
  // Connection timeouts optimized for stability
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || (isReplit ? '10000' : '30000')), 
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || (isReplit ? '60000' : '120000')), 
  maxLifetimeSeconds: parseInt(process.env.DB_MAX_LIFETIME || (isReplit ? '300' : '600')), 
  
  // Performance settings
  allowExitOnIdle: true,
  application_name: process.env.DB_APP_NAME || 'arcelik-ecommerce',
  
  // Query timeouts
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '15000'), 
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '10000'), 
  
  // SSL configuration for production
  ssl: isProduction && process.env.DB_SSL_ENABLED === 'true' ? { 
    rejectUnauthorized: false,
    ca: process.env.DB_SSL_CA || undefined,
    cert: process.env.DB_SSL_CERT || undefined,
    key: process.env.DB_SSL_KEY || undefined,
  } : false,
  
  // Additional performance options
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Choose the appropriate database driver based on environment
let pool: any;
let db: any;

// Logger configuration for development
const loggerConfig = process.env.NODE_ENV === 'development' ? {
  logQuery: (query: string, params: unknown[]) => {
    // Log slow queries in development
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      if (duration > 1000) { // Log queries taking more than 1 second
        console.warn(`🐌 Slow query (${duration}ms):`, query.substring(0, 100) + '...');
      }
    };
  }
} : false;

// Database connection health monitoring
let connectionErrors = 0;
let lastHealthCheck = Date.now();

// Initialize database connection based on environment
if (isNeonDatabase && !isDocker) {
  // Use Neon serverless driver for Neon databases (Replit)
  // Configure Neon for WebSocket support
  neonConfig.webSocketConstructor = ws;
  
  console.log('🌐 Using Neon serverless database driver (Replit/Neon environment)');
  pool = new NeonPool(poolConfig);
  db = drizzleNeon({ client: pool, schema, logger: loggerConfig });
} else {
  // Use standard PostgreSQL driver for Docker/local PostgreSQL
  if (isDocker) {
    console.log('🐳 Using PostgreSQL driver (Docker environment)');
  } else {
    console.log('🐘 Using PostgreSQL driver (Local/VPS environment)');
  }
  
  pool = new PgPool(poolConfig);
  db = drizzlePg({ client: pool, schema, logger: loggerConfig });
}

// Set up event handlers after pool initialization
pool.on('connect', (client: any) => {
  console.log('🔗 New database connection established');
  connectionErrors = 0; // Reset error counter on successful connection
});

pool.on('error', (err: Error) => {
  console.error('💥 Database pool error:', err.message);
  connectionErrors++;
  
  // Log critical connection issues
  if (connectionErrors > 5) {
    console.error('🚨 Multiple database connection errors detected!');
  }
});

pool.on('remove', (client: any) => {
  console.log('🔌 Database connection removed from pool');
});

export { pool, db };

// Logger configuration already applied during database initialization above

// Database health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  totalConnections: number;
  idleConnections: number;
  waitingCount: number;
  lastError?: string;
}> {
  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    const responseTime = Date.now() - start;
    
    lastHealthCheck = Date.now();
    
    return {
      status: responseTime > 5000 ? 'degraded' : 'healthy',
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return {
      status: 'unhealthy',
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingCount: pool.waitingCount,
      lastError: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Graceful shutdown handler
export async function closeDatabaseConnections(): Promise<void> {
  console.log('🔄 Closing database connections...');
  try {
    await pool.end();
    console.log('✅ Database connections closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
}

// Performance monitoring helper
export function getDatabaseStats() {
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingCount: pool.waitingCount,
    connectionErrors,
    lastHealthCheck: new Date(lastHealthCheck).toISOString(),
    uptime: Date.now() - lastHealthCheck,
  };
}