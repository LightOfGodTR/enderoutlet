// Enhanced database configuration and performance utilities for PostgreSQL + Drizzle
import { sql } from 'drizzle-orm';
import { db } from './db';

// Database configuration constants for optimal performance
export const DATABASE_CONFIG = {
  // Connection pool optimization
  POOL: {
    MIN_CONNECTIONS: parseInt(process.env.DB_POOL_MIN || '2'),
    MAX_CONNECTIONS: parseInt(process.env.DB_POOL_MAX || '20'),
    MAX_USES_PER_CONNECTION: parseInt(process.env.DB_POOL_MAX_USES || '7500'),
    CONNECTION_TIMEOUT: parseInt(process.env.DB_CONNECT_TIMEOUT || '30000'),
    IDLE_TIMEOUT: parseInt(process.env.DB_IDLE_TIMEOUT || '300000'),
    MAX_LIFETIME: parseInt(process.env.DB_MAX_LIFETIME || '3600'),
  },

  // Query performance settings
  QUERIES: {
    SLOW_QUERY_THRESHOLD: parseInt(process.env.DB_SLOW_QUERY_MS || '1000'),
    STATEMENT_TIMEOUT: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
    QUERY_TIMEOUT: parseInt(process.env.DB_QUERY_TIMEOUT || '15000'),
    BATCH_SIZE: parseInt(process.env.DB_BATCH_SIZE || '1000'),
  },

  // Caching configuration
  CACHE: {
    QUERY_CACHE_TTL: parseInt(process.env.DB_CACHE_TTL || '300'), // 5 minutes
    RESULT_CACHE_SIZE: parseInt(process.env.DB_CACHE_SIZE || '100'),
    ENABLE_QUERY_CACHE: process.env.DB_ENABLE_CACHE === 'true',
  },

  // Performance monitoring
  MONITORING: {
    ENABLE_SLOW_QUERY_LOG: process.env.NODE_ENV === 'development',
    ENABLE_QUERY_STATS: process.env.DB_ENABLE_STATS === 'true',
    LOG_CONNECTION_EVENTS: process.env.NODE_ENV === 'development',
  }
};

// Performance monitoring interface
interface QueryPerformanceMetrics {
  queryCount: number;
  slowQueries: number;
  averageQueryTime: number;
  totalQueryTime: number;
  cacheHits: number;
  cacheMisses: number;
  lastResetTime: Date;
}

// Global performance metrics tracker
let performanceMetrics: QueryPerformanceMetrics = {
  queryCount: 0,
  slowQueries: 0,
  averageQueryTime: 0,
  totalQueryTime: 0,
  cacheHits: 0,
  cacheMisses: 0,
  lastResetTime: new Date(),
};

// Simple in-memory query result cache
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Performance optimization utilities
export class DatabasePerformanceUtils {
  
  // Execute query with performance monitoring
  static async executeWithMetrics<T>(
    queryFn: () => Promise<T>,
    queryName: string = 'unknown'
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      // Update performance metrics
      performanceMetrics.queryCount++;
      performanceMetrics.totalQueryTime += duration;
      performanceMetrics.averageQueryTime = performanceMetrics.totalQueryTime / performanceMetrics.queryCount;
      
      if (duration > DATABASE_CONFIG.QUERIES.SLOW_QUERY_THRESHOLD) {
        performanceMetrics.slowQueries++;
        if (DATABASE_CONFIG.MONITORING.ENABLE_SLOW_QUERY_LOG) {
          console.warn(`🐌 Slow query detected: ${queryName} took ${duration}ms`);
        }
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Query failed: ${queryName} after ${duration}ms`, error);
      throw error;
    }
  }

  // Cached query execution
  static async executeWithCache<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttl: number = DATABASE_CONFIG.CACHE.QUERY_CACHE_TTL
  ): Promise<T> {
    if (!DATABASE_CONFIG.CACHE.ENABLE_QUERY_CACHE) {
      return queryFn();
    }

    // Check cache first
    const cached = queryCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < (cached.ttl * 1000)) {
      performanceMetrics.cacheHits++;
      return cached.data;
    }

    // Cache miss - execute query
    performanceMetrics.cacheMisses++;
    const result = await this.executeWithMetrics(queryFn, `cached:${cacheKey}`);
    
    // Store in cache
    queryCache.set(cacheKey, {
      data: result,
      timestamp: now,
      ttl: ttl
    });

    // Clean old cache entries if cache is too large
    if (queryCache.size > DATABASE_CONFIG.CACHE.RESULT_CACHE_SIZE) {
      this.cleanupCache();
    }

    return result;
  }

  // Batch operations for better performance
  static async executeBatch<T>(
    items: T[],
    operation: (batch: T[]) => Promise<void>,
    batchSize: number = DATABASE_CONFIG.QUERIES.BATCH_SIZE
  ): Promise<void> {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await this.executeWithMetrics(
        () => operation(batch),
        `batch-operation-${batch.length}-items`
      );
    }
  }

  // Cache management
  static cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(queryCache.entries());
    
    // Remove expired entries
    const expiredKeys = entries
      .filter(([key, value]) => (now - value.timestamp) > (value.ttl * 1000))
      .map(([key]) => key);
    
    expiredKeys.forEach(key => queryCache.delete(key));

    // If still too large, remove oldest entries
    if (queryCache.size > DATABASE_CONFIG.CACHE.RESULT_CACHE_SIZE) {
      const sortedEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, queryCache.size - DATABASE_CONFIG.CACHE.RESULT_CACHE_SIZE);
      
      sortedEntries.forEach(([key]) => queryCache.delete(key));
    }
  }

  // Get performance metrics
  static getPerformanceMetrics(): QueryPerformanceMetrics & {
    cacheSize: number;
    cacheHitRate: number;
  } {
    const totalCacheRequests = performanceMetrics.cacheHits + performanceMetrics.cacheMisses;
    const cacheHitRate = totalCacheRequests > 0 ? 
      (performanceMetrics.cacheHits / totalCacheRequests) * 100 : 0;

    return {
      ...performanceMetrics,
      cacheSize: queryCache.size,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    };
  }

  // Reset performance metrics
  static resetMetrics(): void {
    performanceMetrics = {
      queryCount: 0,
      slowQueries: 0,
      averageQueryTime: 0,
      totalQueryTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastResetTime: new Date(),
    };
  }

  // Database optimization queries
  static async optimizeDatabase(): Promise<{
    vacuumResults: any[];
    analyzeResults: any[];
    indexRecommendations: string[];
  }> {
    console.log('🔧 Starting database optimization...');
    
    try {
      // VACUUM to reclaim storage and update statistics
      await db.execute(sql`VACUUM ANALYZE;`);
      
      // Get table statistics
      const tableStats = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables 
        ORDER BY n_live_tup DESC;
      `);

      // Get index usage statistics
      const indexStats = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan as index_scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes 
        ORDER BY idx_scan DESC;
      `);

      // Generate index recommendations
      const recommendations: string[] = [];
      
      // Check for unused indexes
      const unusedIndexes = (indexStats as any[]).filter(idx => idx.index_scans === 0);
      if (unusedIndexes.length > 0) {
        recommendations.push(`Consider removing ${unusedIndexes.length} unused indexes to improve write performance`);
      }

      // Check for tables without primary keys
      const tablesWithoutPK = await db.execute(sql`
        SELECT t.table_name
        FROM information_schema.tables t
        LEFT JOIN information_schema.table_constraints tc
          ON t.table_name = tc.table_name 
          AND tc.constraint_type = 'PRIMARY KEY'
        WHERE t.table_schema = 'public' 
          AND t.table_type = 'BASE TABLE'
          AND tc.table_name IS NULL;
      `);

      if ((tablesWithoutPK as any[]).length > 0) {
        recommendations.push('Some tables are missing primary keys - consider adding them for better performance');
      }

      console.log('✅ Database optimization completed');
      
      return {
        vacuumResults: tableStats as any[],
        analyzeResults: indexStats as any[],
        indexRecommendations: recommendations,
      };
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
      throw error;
    }
  }
}

// Connection optimization helper
export async function optimizeConnections(): Promise<void> {
  try {
    // Set optimal connection parameters
    await db.execute(sql`SET statement_timeout = ${DATABASE_CONFIG.QUERIES.STATEMENT_TIMEOUT};`);
    await db.execute(sql`SET lock_timeout = 10000;`); // 10 seconds
    await db.execute(sql`SET idle_in_transaction_session_timeout = 60000;`); // 60 seconds
    await db.execute(sql`SET tcp_keepalives_idle = 600;`); // 10 minutes
    await db.execute(sql`SET tcp_keepalives_interval = 30;`); // 30 seconds
    await db.execute(sql`SET tcp_keepalives_count = 3;`);
    
    console.log('✅ Database connection parameters optimized');
  } catch (error) {
    console.error('❌ Failed to optimize connection parameters:', error);
  }
}

// Auto-cleanup task that runs periodically
setInterval(() => {
  DatabasePerformanceUtils.cleanupCache();
}, 5 * 60 * 1000); // Clean up every 5 minutes

export { performanceMetrics };