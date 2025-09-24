import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";

// Extend Express session to include userId
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}
import { createHash } from "node:crypto";
import { spawn } from "child_process";
import express from "express";
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { storage } from "./storage";
import { emailService } from "./emailService";
import { ObjectStorageService, objectStorageClient } from "./objectStorage";
import { checkDatabaseHealth, getDatabaseStats } from "./db";
import { DatabasePerformanceUtils, optimizeConnections } from "./database-config";
import {
  insertProductSchema,
  insertCartItemSchema,
  insertUserSchema,
  insertFavoriteSchema,
  insertReviewSchema,
  insertAddressSchema,
  insertSupportTicketSchema,
  insertSupportTicketMessageSchema,
  insertContactMessageSchema,
  insertCategoryIconSchema,
  insertProductCardSchema,
  insertPopularSearchSchema,
  insertCategoryBannerSchema,
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";
import session from "express-session";
import pgSession from "connect-pg-simple";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import { body, validationResult } from "express-validator";
import compression from "compression";
import morgan from "morgan";

// Performance recommendations helper function
function generatePerformanceRecommendations(dbHealth: any, dbStats: any): string[] {
  const recommendations: string[] = [];
  
  // Connection pool recommendations
  if (dbHealth.totalConnections > 0) {
    const utilizationRate = (dbHealth.totalConnections - dbHealth.idleConnections) / dbHealth.totalConnections;
    if (utilizationRate > 0.8) {
      recommendations.push('Consider increasing the connection pool size - high utilization detected');
    } else if (utilizationRate < 0.1) {
      recommendations.push('Consider reducing the connection pool size - low utilization detected');
    }
  }
  
  // Waiting connections
  if (dbHealth.waitingCount > 0) {
    recommendations.push('Connections are waiting - consider increasing pool size or optimizing queries');
  }
  
  // Error rate
  if (dbStats.connectionErrors > 0) {
    recommendations.push('Connection errors detected - check network stability and database health');
  }
  
  // Memory recommendations
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed / memUsage.heapTotal > 0.8) {
    recommendations.push('High memory usage detected - consider query optimization or caching');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Database performance appears optimal');
  }
  
  return recommendations;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Trust proxy for rate limiting and security (critical for production)
  app.set('trust proxy', 1);

  // Security headers with helmet (production-optimized)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: process.env.NODE_ENV === 'production' 
          ? ["'self'", "fonts.googleapis.com"] 
          : ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "storage.googleapis.com", "*.googleapis.com"],
        scriptSrc: process.env.NODE_ENV === 'production'
          ? ["'self'", "'nonce-[generated]'"]
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Dev mode only
        connectSrc: ["'self'", "ws:", "wss:", "*.googleapis.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: process.env.NODE_ENV === 'production' ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    } : false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  }));

  // Compression for performance
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // Security logging
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }));

  // Prevent Parameter Pollution
  app.use(hpp());

  // Data sanitization against NoSQL injection
  app.use(mongoSanitize());

  // Optimized rate limiting for high traffic
  const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window for faster recovery
    max: process.env.NODE_ENV === 'production' ? 10000 : 50000, // Much higher limits
    message: {
      error: "Çok fazla istek gönderildi. Lütfen 1 dakika sonra tekrar deneyin."
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for static assets and health checks
      return req.url.startsWith('/uploads') || 
             req.url.startsWith('/static') || 
             req.url === '/health' ||
             req.url === '/favicon.ico';
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: "Çok fazla istek gönderildi. Lütfen 1 dakika sonra tekrar deneyin."
      });
    }
  });

  // Authentication rate limiting (more reasonable)
  const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes window
    max: process.env.NODE_ENV === 'production' ? 50 : 100, // More reasonable auth attempts
    message: {
      error: "Çok fazla giriş denemesi yapıldı. Lütfen 5 dakika sonra tekrar deneyin."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: "Çok fazla giriş denemesi yapıldı. Lütfen 5 dakika sonra tekrar deneyin."
      });
    }
  });

  // API rate limiting optimized for high traffic
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: process.env.NODE_ENV === 'production' ? 5000 : 10000, // High API limits
    message: {
      error: "API istek limiti aşıldı. Lütfen 1 dakika sonra tekrar deneyin."
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for read-only operations in production
      return process.env.NODE_ENV !== 'production' && req.method === 'GET';
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: "API istek limiti aşıldı. Lütfen 1 dakika sonra tekrar deneyin."
      });
    }
  });

  // Apply general rate limiting to all requests
  app.use(generalLimiter);

  // Apply API rate limiting to all /api routes
  app.use('/api', apiLimiter);

  // Serve static files with aggressive caching for production performance
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '1h', // Long cache for production
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Set cache headers for different file types
      if (path.endsWith('.js') || path.endsWith('.css')) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
      } else if (path.match(/\.(jpg|jpeg|png|gif|webp|ico|svg)$/i)) {
        res.set('Cache-Control', 'public, max-age=2592000'); // 30 days for images
      }
    }
  }));

  // Enhanced health check endpoint with database monitoring
  app.get('/health', async (req: Request, res: Response) => {
    try {
      const dbHealth = await checkDatabaseHealth();
      const dbStats = getDatabaseStats();
      
      const overallStatus = dbHealth.status === 'healthy' ? 'healthy' : 
                           dbHealth.status === 'degraded' ? 'degraded' : 'unhealthy';
      
      const healthData = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0',
        database: {
          status: dbHealth.status,
          connections: {
            total: dbHealth.totalConnections,
            idle: dbHealth.idleConnections,
            waiting: dbHealth.waitingCount,
          },
          stats: dbStats,
          lastError: dbHealth.lastError,
        },
        environment: process.env.NODE_ENV || 'development',
      };

      const statusCode = overallStatus === 'healthy' ? 200 : 
                        overallStatus === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json(healthData);
    } catch (error) {
      console.error('❌ Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // API health endpoint for deployment verification (alias to main health check)
  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      const dbHealth = await checkDatabaseHealth();
      const dbStats = getDatabaseStats();
      
      const overallStatus = dbHealth.status === 'healthy' ? 'healthy' : 
                           dbHealth.status === 'degraded' ? 'degraded' : 'unhealthy';
      
      const healthData = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0',
        database: {
          status: dbHealth.status,
          connections: {
            total: dbHealth.totalConnections,
            idle: dbHealth.idleConnections,
            waiting: dbHealth.waitingCount,
          },
          stats: dbStats,
          lastError: dbHealth.lastError,
        },
        environment: process.env.NODE_ENV || 'development',
      };

      const statusCode = overallStatus === 'healthy' ? 200 : 
                        overallStatus === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json(healthData);
    } catch (error) {
      console.error('❌ API Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Dedicated database health and performance monitoring endpoint
  app.get('/api/admin/database/health', async (req: Request, res: Response) => {
    try {
      const dbHealth = await checkDatabaseHealth();
      const dbStats = getDatabaseStats();
      
      res.status(200).json({
        health: dbHealth,
        stats: dbStats,
        performance: {
          connectionUtilization: dbHealth.totalConnections > 0 ? 
            (dbHealth.totalConnections - dbHealth.idleConnections) / dbHealth.totalConnections * 100 : 0,
          poolEfficiency: dbHealth.waitingCount === 0 ? 100 : 
            Math.max(0, 100 - (dbHealth.waitingCount * 10)),
        },
        recommendations: generatePerformanceRecommendations(dbHealth, dbStats),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      res.status(500).json({
        error: 'Database health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Database performance metrics endpoint
  app.get('/api/admin/database/metrics', async (req: Request, res: Response) => {
    try {
      const performanceMetrics = DatabasePerformanceUtils.getPerformanceMetrics();
      res.status(200).json({
        metrics: performanceMetrics,
        recommendations: [],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Failed to get performance metrics:', error);
      res.status(500).json({
        error: 'Failed to get performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Database optimization endpoint
  app.post('/api/admin/database/optimize', async (req: Request, res: Response) => {
    try {
      console.log('🔧 Starting database optimization...');
      
      // Run optimization tasks
      const [optimizationResults] = await Promise.all([
        DatabasePerformanceUtils.optimizeDatabase(),
        optimizeConnections(),
      ]);

      res.status(200).json({
        message: 'Database optimization completed',
        results: optimizationResults,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
      res.status(500).json({
        error: 'Database optimization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Reset performance metrics endpoint
  app.post('/api/admin/database/reset-metrics', (req: Request, res: Response) => {
    try {
      DatabasePerformanceUtils.resetMetrics();
      res.status(200).json({
        message: 'Performance metrics reset successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Failed to reset metrics:', error);
      res.status(500).json({
        error: 'Failed to reset metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Comprehensive database status endpoint
  app.get('/api/admin/database/status', async (req: Request, res: Response) => {
    try {
      const [dbHealth, dbStats, performanceMetrics] = await Promise.all([
        checkDatabaseHealth(),
        getDatabaseStats(),
        DatabasePerformanceUtils.getPerformanceMetrics(),
      ]);

      const overallHealth = dbHealth.status === 'healthy' ? 'optimal' : 
                           dbHealth.status === 'degraded' ? 'warning' : 'critical';

      res.status(200).json({
        status: overallHealth,
        health: dbHealth,
        connectionStats: dbStats,
        performanceMetrics,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Failed to get database status:', error);
      res.status(500).json({
        error: 'Failed to get database status',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Configure multer for file uploads with enhanced security
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 5, // Maximum 5 files
      fieldSize: 1024 * 1024, // 1MB field size limit
    },
    fileFilter: (req, file, cb) => {
      // Only allow image files with strict MIME type checking
      const allowedMimes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Sadece JPEG, PNG, GIF ve WebP formatlarında resim dosyaları kabul edilir"));
      }
    },
  });

  // Enhanced session configuration with PostgreSQL store (cluster-safe)
  const PgSession = pgSession(session);
  app.use(
    session({
      store: new PgSession({
        conString: process.env.DATABASE_URL,
        tableName: 'session',
        createTableIfMissing: true,
        pruneSessionInterval: 60, // Clean up expired sessions every hour
      }),
      secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      resave: false,
      saveUninitialized: false,
      name: 'sessionId', // Change default session name
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000, // 2 hours (shorter for security)
        sameSite: "strict", // Stricter CSRF protection
      },
      rolling: true, // Extend session on each request
      genid: () => crypto.randomUUID(), // Generate secure session IDs
    }),
  );

  // Input validation helpers
  const passwordValidation = [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Şifre en az 8 karakter olmalıdır')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Şifre en az 1 küçük harf, 1 büyük harf, 1 rakam ve 1 özel karakter içermelidir'),
  ];

  const emailValidation = [
    body('email')
      .isEmail()
      .withMessage('Geçerli bir e-posta adresi giriniz')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('E-posta adresi çok uzun'),
  ];

  // Phone validation removed from here - will be done manually in the route

  const nameValidation = [
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Ad 2-50 karakter arasında olmalıdır')
      .matches(/^[a-zA-ZğüşıöçĞÜŞIÖÇ\s]+$/)
      .withMessage('Ad sadece harf içerebilir'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Soyad 2-50 karakter arasında olmalıdır')
      .matches(/^[a-zA-ZğüşıöçĞÜŞIÖÇ\s]+$/)
      .withMessage('Soyad sadece harf içerebilir'),
  ];

  // Validation error handler
  const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Girilen bilgilerde hata var',
        details: errors.array().map(err => err.msg)
      });
    }
    next();
  };

  // Auth routes with enhanced security - validation BEFORE rate limiting
  app.post("/api/auth/register", 
    ...emailValidation,
    ...passwordValidation,
    ...nameValidation,
    handleValidationErrors,
    authLimiter, // Apply rate limiting AFTER validation
    async (req, res) => {
    try {
      // Clean phone number before validation
      const cleanedPhone = req.body.phone.replace(/\D/g, ''); // Remove non-digits
      console.log('📱 Phone validation - Original:', req.body.phone, 'Cleaned:', cleanedPhone);
      
      // Validate cleaned phone number
      if (!cleanedPhone || cleanedPhone.length !== 11 || !cleanedPhone.startsWith('0')) {
        return res.status(400).json({
          error: 'Girilen bilgilerde hata var',
          details: ['11 haneli geçerli bir telefon numarası girin (05XX XXX XX XX)']
        });
      }
      
      // Additional security: Clean and validate input
      const cleanedBody = {
        email: req.body.email.toLowerCase().trim(),
        password: req.body.password,
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
        phone: cleanedPhone,
        tcKimlik: req.body.tcKimlik?.replace(/\D/g, '') || null
      };

      const validatedData = insertUserSchema.parse(cleanedBody);

      // Check if user already exists by email or phone (regardless of verification status)
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Bu e-posta adresi zaten kullanımda" });
      }

      const existingPhone = await storage.getUserByPhone(validatedData.phone);
      if (existingPhone) {
        return res.status(400).json({ error: "Bu telefon numarası zaten kullanımda" });
      }

      // Create user (password will be hashed in storage layer)
      const user = await storage.createUser(validatedData);

      // Send welcome email
      try {
        const success = await emailService.sendWelcomeEmail(user.email, user.firstName);
        if (success) {
          console.log('✅ Welcome email sent to:', user.email);
        } else {
          console.error('❌ Failed to send welcome email to:', user.email);
        }
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError);
        // Don't fail the registration if email fails
      }

      // Set session
      (req.session as any).userId = user.id;

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid user data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to register user" });
      }
    }
  });

  app.post("/api/auth/login", 
    [
      body('emailOrPhone')
        .trim()
        .isLength({ min: 1 })
        .withMessage('E-posta veya telefon numarası gereklidir'),
      body('password')
        .isLength({ min: 1 })
        .withMessage('Şifre gereklidir'),
    ],
    handleValidationErrors,
    authLimiter, // Apply rate limiting AFTER validation
    async (req: Request, res: Response) => {
    try {
      const { emailOrPhone, password, rememberMe } = req.body;

      // Clean input data
      const cleanedEmailOrPhone = emailOrPhone.toLowerCase().trim();

      // Try to find user by email first, then by phone  
      let user = await storage.getUserByEmail(cleanedEmailOrPhone);
      if (!user) {
        user = await storage.getUserByPhone(cleanedEmailOrPhone);
      }

      // Always use the same error message to prevent user enumeration attacks
      if (!user) {
        // Add delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, 100));
        return res.status(401).json({ error: "E-posta/telefon veya şifre hatalı" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        // Add delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, 100));
        return res.status(401).json({ error: "E-posta/telefon veya şifre hatalı" });
      }

      // Set session with extended duration if "remember me" is checked
      (req.session as any).userId = user.id;

      if (rememberMe) {
        // Extend session to 7 days max if "remember me" is checked (reduced for security)
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        req.session.cookie.expires = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        );
      } else {
        // Default session duration (2 hours as configured above)
        req.session.cookie.maxAge = 2 * 60 * 60 * 1000; // 2 hours
        req.session.cookie.expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
      }

      // Force session to be saved
      req.session.save((err: Error | null) => {
        if (err) {
          console.error("Session save error:", err);
        }
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Giriş işlemi sırasında bir hata oluştu" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ error: "Çıkış işlemi başarısız" });
        }
        res.clearCookie('sessionId'); // Clear the session cookie
        res.json({ success: true });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: "Çıkış işlemi başarısız" });
    }
  });

  // Email verification endpoints
  app.post("/api/auth/resend-email-verification", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const token = await storage.generateEmailVerificationToken(userId);
      const user = await storage.getUser(userId);
      
      if (user && user.email) {
        const success = await emailService.sendEmailVerificationEmail(user.email, token);
        if (success) {
          console.log('✅ Email verification sent to:', user.email);
          return res.json({ success: true, message: "Doğrulama e-postası gönderildi" });
        } else {
          console.error('❌ Failed to send email verification to:', user.email);
          return res.status(500).json({ error: "E-posta gönderilemedi" });
        }
      }
      
      res.status(404).json({ error: "User not found" });
    } catch (error) {
      console.error("Resend email verification error:", error);
      res.status(500).json({ error: "E-posta gönderilemedi" });
    }
  });



  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: "Geçersiz token" });
      }

      const user = await storage.verifyEmailToken(token);
      if (user) {
        res.json({ success: true, message: "E-posta doğrulandı" });
      } else {
        res.status(400).json({ error: "Geçersiz veya süresi dolmuş token" });
      }
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ error: "Doğrulama başarısız" });
    }
  });

  app.post("/api/auth/forgot-password", 
    ...emailValidation,
    handleValidationErrors,
    authLimiter, // Apply rate limiting AFTER validation
    async (req, res) => {
    try {
      const { email } = req.body;

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Geçerli bir e-posta adresi girin" });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security reasons, don't reveal if email exists or not
        return res.json({ 
          success: true, 
          message: "Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama talimatları gönderilmiştir." 
        });
      }

      // Generate secure reset token
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      // Save token to database
      await storage.createPasswordResetToken(user.id, resetToken, expiresAt);

      // Send email with reset link
      const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);

      if (emailSent) {
        console.log(`Password reset email sent to: ${email}`);
        res.json({ 
          success: true, 
          message: "Şifre sıfırlama talimatları e-posta adresinize gönderildi." 
        });
      } else {
        console.error(`Failed to send password reset email to: ${email}`);
        res.status(500).json({ error: "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin." });
      }

    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Şifre sıfırlama isteği işlenirken bir hata oluştu" });
    }
  });

  app.post("/api/auth/reset-password", 
    [
      body('token')
        .isLength({ min: 1 })
        .withMessage('Token gereklidir'),
      ...passwordValidation
    ],
    handleValidationErrors,
    authLimiter, // Apply rate limiting AFTER validation
    async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      // Validate password strength
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır" });
      }

      // Get token from database
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ error: "Geçersiz veya kullanılmış token" });
      }

      // Check if token has expired
      if (new Date() > new Date(resetToken.expiresAt)) {
        return res.status(400).json({ error: "Token süresi dolmuş. Lütfen yeni şifre sıfırlama isteği oluşturun." });
      }

      // Reset user password
      const updatedUser = await storage.resetUserPassword(resetToken.userId, newPassword);
      if (!updatedUser) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }

      // Mark token as used
      await storage.markPasswordResetTokenAsUsed(token);

      res.json({ 
        success: true, 
        message: "Şifreniz başarıyla sıfırlandı. Artık yeni şifrenizle giriş yapabilirsiniz." 
      });

    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Şifre sıfırlama işlemi sırasında bir hata oluştu" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.put("/api/auth/update-profile", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { firstName, lastName, phone } = req.body;

      // Validate required fields
      if (!firstName || !lastName) {
        return res.status(400).json({ error: "First name and last name are required" });
      }

      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        phone,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Email verification endpoints
  app.post("/api/auth/send-email-verification", authLimiter, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: "E-posta adresi zaten doğrulanmış" });
      }

      // Generate verification token
      const token = await storage.generateEmailVerificationToken(userId);

      // Send verification email
      const emailSent = await emailService.sendEmailVerificationEmail(user.email, token);

      if (emailSent) {
        res.json({ 
          success: true, 
          message: "Doğrulama e-postası gönderildi. E-posta kutunuzu kontrol edin." 
        });
      } else {
        res.status(500).json({ error: "Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin." });
      }
    } catch (error) {
      console.error("Send email verification error:", error);
      res.status(500).json({ error: "E-posta doğrulama gönderimi sırasında bir hata oluştu" });
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: "Doğrulama token'ı gereklidir" });
      }

      const user = await storage.verifyEmailToken(token);
      if (!user) {
        return res.status(400).json({ error: "Geçersiz veya süresi dolmuş doğrulama token'ı" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ 
        success: true, 
        message: "E-posta adresiniz başarıyla doğrulandı!",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(500).json({ error: "E-posta doğrulama sırasında bir hata oluştu" });
    }
  });


  // Resend verification endpoints
  app.post("/api/auth/resend-email-verification", authLimiter, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: "E-posta adresi zaten doğrulanmış" });
      }

      // Generate new verification token
      const token = await storage.resendEmailVerification(userId);

      // Send verification email
      const emailSent = await emailService.sendEmailVerificationEmail(user.email, token);

      if (emailSent) {
        res.json({ 
          success: true, 
          message: "Yeni doğrulama e-postası gönderildi." 
        });
      } else {
        res.status(500).json({ error: "Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin." });
      }
    } catch (error) {
      console.error("Resend email verification error:", error);
      res.status(500).json({ error: "E-posta doğrulama yeniden gönderimi sırasında bir hata oluştu" });
    }
  });


  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get similar products (same category, exclude current product) - MUST be before /:id route
  app.get("/api/products/:id/similar", async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Get all products from the same category
      const categoryProducts = await storage.getProductsByCategory(product.category);
      
      // Filter out the current product and shuffle
      const otherProducts = categoryProducts.filter(p => p.id !== productId);
      
      // Shuffle and take first 5 products
      const shuffled = otherProducts.sort(() => 0.5 - Math.random());
      const similarProducts = shuffled.slice(0, 5);
      
      res.json(similarProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch similar products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      
      // Otomatik SEO oluştur
      try {
        await storage.generateProductSeo(product);
        console.log(`Auto-generated SEO for product: ${product.name}`);
      } catch (seoError) {
        console.error("Failed to generate SEO for product:", seoError);
        // SEO hatası ürün oluşturma işlemini engellemez
      }
      
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid product data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const updates = req.body;
      console.log("Updating product:", { id: req.params.id, updates });

      // Clean up the updates object - only keep fields that should be updated
      const cleanUpdates = {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        originalPrice: updates.originalPrice,
        category: updates.category,
        subcategory: updates.subcategory,
        brand: updates.brand,
        image: updates.image,
        images: updates.images,
        features: updates.features,
        inStock: updates.inStock,
        energyClass: updates.energyClass,
      };

      // Remove undefined/null values
      Object.keys(cleanUpdates).forEach((key) => {
        if ((cleanUpdates as any)[key] === undefined || (cleanUpdates as any)[key] === null) {
          delete (cleanUpdates as any)[key];
        }
      });

      console.log("Clean product updates:", cleanUpdates);

      const validatedData = insertProductSchema.partial().parse(cleanUpdates);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid product data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update product" });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const cartItems = await storage.getCartItems(userId);
      const cartWithProducts = [];

      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          let warrantyPrice = 0;
          
          // Calculate warranty price if warranty is selected
          if (item.warranty && item.warranty !== 'none' && product.category && product.subcategory) {
            try {
              // Use the same logic as the warranty endpoint
              const productSubcategories = product.subcategory.split(',').map(s => s.trim());
              const allWarranties = await storage.getExtendedWarrantyCategories();
              
              // Find applicable warranty
              let applicableWarranty = null;
              for (const warranty of allWarranties) {
                const mappings = await storage.getWarrantyCategoryMappings(warranty.id);
                
                const hasValidMapping = mappings.some(mapping => {
                  if (!mapping.productSubcategory || mapping.productSubcategory === "ALL_SUBCATEGORIES") {
                    return mapping.productCategory === product.category;
                  }
                  return mapping.productCategory === product.category && 
                         productSubcategories.includes(mapping.productSubcategory);
                });
                
                if (hasValidMapping) {
                  applicableWarranty = warranty;
                  break;
                }
              }
              
              // Get warranty price based on type and multiply by quantity
              if (applicableWarranty) {
                let singleWarrantyPrice = 0;
                switch (item.warranty) {
                  case '2year':
                    singleWarrantyPrice = parseFloat(applicableWarranty.twoYearPrice?.toString() || '0');
                    break;
                  case '4year':
                    singleWarrantyPrice = parseFloat(applicableWarranty.fourYearPrice?.toString() || '0');
                    break;
                }
                warrantyPrice = singleWarrantyPrice * item.quantity; // Multiply by quantity
                console.log(`[CART] Warranty price calculated: ${singleWarrantyPrice} x ${item.quantity} = ${warrantyPrice} for ${item.warranty} on ${product.name}`);
              } else {
                console.log(`[CART] No applicable warranty found for ${product.name} with warranty ${item.warranty}`);
              }
            } catch (warrantyError) {
              console.error('Error calculating warranty price:', warrantyError);
              warrantyPrice = 0;
            }
          }
          
          cartWithProducts.push({
            ...item,
            product,
            warrantyPrice, // Add warranty price to cart item
          });
        }
      }

      res.json(cartWithProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      console.log("Cart request body:", req.body);
      console.log("Cart userId:", userId);

      // Parse and validate the data
      const dataToValidate = {
        ...req.body,
        userId,
        quantity: parseInt(req.body.quantity) || 1, // Ensure quantity is integer
        warranty: req.body.warranty || undefined, // Handle optional warranty
      };

      console.log("Data to validate:", dataToValidate);

      const validatedData = insertCartItemSchema.parse(dataToValidate);
      console.log("Validated data:", validatedData);

      // Check if item already exists in cart
      const existingItems = await storage.getCartItems(userId);
      const existingItem = existingItems.find(
        (item) =>
          item.productId === validatedData.productId &&
          item.warranty === validatedData.warranty,
      );

      if (existingItem) {
        // Update quantity if item exists
        const updatedItem = await storage.updateCartItemQuantity(
          existingItem.id,
          existingItem.quantity + (validatedData.quantity || 1),
        );
        res.json(updatedItem);
      } else {
        // Create new cart item
        const cartItem = await storage.addToCart(validatedData);
        res.status(201).json(cartItem);
      }
    } catch (error) {
      console.error("Cart error:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        res
          .status(400)
          .json({ error: "Invalid cart item data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add item to cart" });
      }
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { quantity } = req.body;
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      const updatedItem = await storage.updateCartItemQuantity(
        req.params.id,
        quantity,
      );
      if (!updatedItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const success = await storage.removeFromCart(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove item from cart" });
    }
  });

  // Favorites routes
  app.get("/api/favorites", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || "default-user";
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || "default-user";
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const favorite = await storage.addToFavorites({ userId, productId });
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:productId", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || "default-user";
      const { productId } = req.params;

      const success = await storage.removeFromFavorites(userId, productId);
      if (!success) {
        return res.status(404).json({ error: "Favorite not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from favorites" });
    }
  });

  // Reviews routes
  app.get("/api/reviews/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const reviews = await storage.getReviews(productId);

      // Get user details for each review
      const reviewsWithUsers = [];
      for (const review of reviews) {
        const user = await storage.getUser(review.userId);
        if (user) {
          reviewsWithUsers.push({
            ...review,
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
            },
          });
        }
      }

      res.json(reviewsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId,
      });

      // Check if user already reviewed this product
      const existingReview = await storage.getUserReviewForProduct(
        userId,
        validatedData.productId,
      );
      if (existingReview) {
        return res
          .status(400)
          .json({ error: "You have already reviewed this product" });
      }

      const review = await storage.addReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid review data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add review" });
      }
    }
  });

  app.get("/api/reviews/:productId/average", async (req, res) => {
    try {
      const { productId } = req.params;
      const reviews = await storage.getReviews(productId);

      if (reviews.length === 0) {
        return res.json({ average: 0, count: 0 });
      }

      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      const average = totalRating / reviews.length;

      res.json({
        average: Math.round(average * 10) / 10, // Round to 1 decimal place
        count: reviews.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate average rating" });
    }
  });

  app.get("/api/reviews/:productId/user-review", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { productId } = req.params;
      const review = await storage.getUserReviewForProduct(userId, productId);

      res.json(review || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user review" });
    }
  });

  // Address routes
  app.get("/api/addresses/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const addresses = await storage.getAddresses(userId);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ error: "Failed to fetch addresses" });
    }
  });

  app.post("/api/addresses", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validatedData = insertAddressSchema.parse({
        ...req.body,
        userId,
      });

      console.log("Creating address with data:", validatedData);
      const address = await storage.addAddress(validatedData);
      res.status(201).json(address);
    } catch (error) {
      console.error("Address creation error:", error);
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Invalid address data", details: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to add address" });
      }
    }
  });

  app.patch("/api/addresses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const address = await storage.updateAddress(id, updates);

      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }

      res.json(address);
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ error: "Failed to update address" });
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAddress(id);

      if (!success) {
        return res.status(404).json({ error: "Address not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ error: "Failed to delete address" });
    }
  });

  app.put("/api/addresses/:id/set-default", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { id } = req.params;
      const success = await storage.setDefaultAddress(userId, id);

      if (!success) {
        return res.status(404).json({ error: "Address not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default address:", error);
      res.status(500).json({ error: "Failed to set default address" });
    }
  });

  app.patch("/api/addresses/:id/default", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const success = await storage.setDefaultAddress(userId, id);

      if (!success) {
        return res
          .status(404)
          .json({ error: "Address not found or unauthorized" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default address:", error);
      res.status(500).json({ error: "Failed to set default address" });
    }
  });

  // User update route for TC Kimlik
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await storage.updateUser(id, updates);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Admin content routes
  app.get("/api/admin/sliders", async (req, res) => {
    try {
      const sliders = await storage.getSliders();
      res.json(sliders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sliders" });
    }
  });

  app.put("/api/admin/sliders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      console.log("Updating slider:", { id, updates });

      // Clean up the updates object - only keep fields that should be updated
      const cleanUpdates = {
        title: updates.title,
        subtitle: updates.subtitle,
        description: updates.description,
        image: updates.image,
        link: updates.link,
        buttonText: updates.buttonText,
        showText: updates.showText,
        backgroundColor: updates.backgroundColor,
        isActive: updates.isActive,
        order: updates.order,
      };

      // Remove undefined/null values
      Object.keys(cleanUpdates).forEach((key) => {
        if ((cleanUpdates as any)[key] === undefined || (cleanUpdates as any)[key] === null) {
          delete (cleanUpdates as any)[key];
        }
      });

      console.log("Clean updates:", cleanUpdates);

      const result = await storage.updateSlider(id, cleanUpdates);
      console.log("Slider update result:", result);

      if (result) {
        res.json({ success: true, slider: result });
      } else {
        res.status(404).json({ error: "Slider not found" });
      }
    } catch (error) {
      console.error("Error updating slider:", error);
      res.status(500).json({ error: "Failed to update slider" });
    }
  });

  app.post("/api/admin/sliders", async (req, res) => {
    try {
      const sliderData = req.body;
      const newSlider = await storage.createSlider(sliderData);
      res.status(201).json({ success: true, slider: newSlider });
    } catch (error) {
      res.status(500).json({ error: "Failed to create slider" });
    }
  });

  app.delete("/api/admin/sliders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSlider(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Slider not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete slider" });
    }
  });

  app.put("/api/admin/sliders/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const result = await storage.toggleSlider(id, isActive);
      if (result) {
        res.json({ success: true, slider: result });
      } else {
        res.status(404).json({ error: "Slider not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle slider" });
    }
  });

  // Update slider image
  app.put("/api/admin/sliders/:id/image", async (req, res) => {
    try {
      const { id } = req.params;
      const { image } = req.body;

      console.log("Updating slider image:", { id, image });

      if (!image) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      const result = await storage.updateSlider(id, { image });
      console.log("Slider image update result:", result);

      if (result) {
        res.json({ success: true, slider: result });
      } else {
        res.status(404).json({ error: "Slider not found" });
      }
    } catch (error) {
      console.error("Error updating slider image:", error);
      res.status(500).json({ error: "Failed to update slider image" });
    }
  });

  // Direct slider image upload endpoint
  app.post(
    "/api/admin/slider-upload-image",
    upload.single("image"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Resim dosyası bulunamadı" });
        }

        // Generate unique filename for slider
        const timestamp = Date.now();
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        const filename = `slider-${timestamp}${fileExtension}`;

        try {
          const objectStorageService = new ObjectStorageService();
          const publicObjectSearchPaths = objectStorageService.getPublicObjectSearchPaths();
          
          if (!publicObjectSearchPaths || publicObjectSearchPaths.length === 0) {
            throw new Error("Public object search paths not configured");
          }

          const publicPath = publicObjectSearchPaths[0]; // Use first public path
          
          // Parse object path manually
          const pathParts = publicPath.split("/");
          const bucketName = pathParts[1];
          const basePath = pathParts.slice(2).join("/");
          const fullObjectPath = `${basePath}/${filename}`;

          const bucket = objectStorageClient.bucket(bucketName);
          const file = bucket.file(fullObjectPath);

          // Upload to Object Storage
          await file.save(req.file.buffer, {
            metadata: {
              contentType: req.file.mimetype,
            },
          });

          // Return public URL for slider
          const imageUrl = `/public-objects/${filename}`;

          console.log(
            `✅ Slider image uploaded to Object Storage: ${filename}`,
          );
          console.log(
            `📁 Bucket: ${bucketName}, Object: ${fullObjectPath}`,
          );
          console.log(
            `🌐 Public URL: ${imageUrl}`,
          );
          
          res.json({ imageUrl });
        } catch (objectStorageError) {
          console.error("Object Storage error, falling back to local storage:", objectStorageError);
          
          // Fallback to local storage
          const uploadsDir = "/tmp/uploads";
          const fullPath = path.join(uploadsDir, filename);

          // Ensure uploads directory exists
          await fs.mkdir(uploadsDir, { recursive: true });

          // Save file
          await fs.writeFile(fullPath, req.file.buffer);

          // Return image URL for slider
          const imageUrl = `/uploads/${filename}`;

          console.log(
            `Slider image uploaded successfully (fallback): ${filename} at ${fullPath}`,
          );
          res.json({ imageUrl });
        }
      } catch (error) {
        console.error("Error uploading slider image:", error);
        res
          .status(500)
          .json({ error: "Slider resimi yüklenirken hata oluştu" });
      }
    },
  );

  // Serve public objects
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/navigation", async (req, res) => {
    try {
      const navigation = await storage.getNavigationItems();
      res.json(navigation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch navigation" });
    }
  });

  // Product Cards Management
  app.get("/api/admin/product-cards", async (req, res) => {
    try {
      const productCards = await storage.getAllProductCards();
      res.json(productCards);
    } catch (error) {
      console.error("Error fetching product cards:", error);
      res.status(500).json({ error: "Failed to fetch product cards" });
    }
  });

  app.post("/api/admin/product-cards", async (req, res) => {
    try {
      const productCard = await storage.createProductCard(req.body);
      res.json(productCard);
    } catch (error) {
      console.error("Error creating product card:", error);
      res.status(500).json({ error: "Failed to create product card" });
    }
  });


  app.delete("/api/admin/product-cards/:id", async (req, res) => {
    try {
      const success = await storage.deleteProductCard(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product card not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product card:", error);
      res.status(500).json({ error: "Failed to delete product card" });
    }
  });

  // Public endpoint for frontend
  app.get("/api/product-cards", async (req, res) => {
    try {
      const productCards = await storage.getAllProductCards();
      const activeCards = productCards.filter(card => card.isActive);
      res.json(activeCards);
    } catch (error) {
      console.error("Error fetching product cards:", error);
      res.status(500).json({ error: "Failed to fetch product cards" });
    }
  });




  // Categories routes
  app.get("/api/admin/categories", async (req, res) => {
    try {
      const categories = storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/admin/categories", async (req, res) => {
    try {
      const category = storage.addCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).json({ error: "Failed to add category" });
    }
  });

  app.patch("/api/admin/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = storage.updateCategory(id, req.body);
      if (category) {
        res.json(category);
      } else {
        res.status(404).json({ error: "Category not found" });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = storage.deleteCategory(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Category not found" });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Virtual POS Configuration Routes
  app.get("/api/virtual-pos/configs", async (req, res) => {
    try {
      const configs = await storage.getActiveVirtualPosConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch virtual POS configurations" });
    }
  });

  // Admin Virtual POS Management Routes
  app.get("/api/admin/virtual-pos", async (req, res) => {
    try {
      const configs = await storage.getVirtualPosConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch virtual POS configurations" });
    }
  });

  app.get("/api/admin/virtual-pos/:id", async (req, res) => {
    try {
      const config = await storage.getVirtualPosConfig(req.params.id);
      if (!config) {
        return res.status(404).json({ error: "Virtual POS configuration not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch virtual POS configuration" });
    }
  });

  app.post("/api/admin/virtual-pos", async (req, res) => {
    try {
      const configData = req.body;
      const newConfig = await storage.createVirtualPosConfig(configData);
      res.status(201).json(newConfig);
    } catch (error) {
      res.status(500).json({ error: "Failed to create virtual POS configuration" });
    }
  });

  app.put("/api/admin/virtual-pos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const result = await storage.updateVirtualPosConfig(id, updates);
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "Virtual POS configuration not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update virtual POS configuration" });
    }
  });

  app.delete("/api/admin/virtual-pos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteVirtualPosConfig(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Virtual POS configuration not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete virtual POS configuration" });
    }
  });

  // Bank Installments Routes
  app.get("/api/virtual-pos/:configId/installments", async (req, res) => {
    try {
      const { configId } = req.params;
      const installments = await storage.getBankInstallments(configId);
      res.json(installments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch installments" });
    }
  });

  // Get all bank installments with VirtualPOS config details for commission rates page
  app.get("/api/commission-rates", async (req, res) => {
    try {
      const allInstallments = await storage.getAllBankInstallmentsWithVirtualPosInfo();
      res.json(allInstallments);
    } catch (error) {
      console.error("Error fetching commission rates:", error);
      res.status(500).json({ error: "Failed to fetch commission rates" });
    }
  });

  // Get all bank installments for admin management
  app.get("/api/admin/bank-installments", async (req, res) => {
    try {
      const installments = await storage.getAllBankInstallments();
      res.json(installments);
    } catch (error) {
      console.error("Error fetching bank installments:", error);
      res.status(500).json({ error: "Failed to fetch bank installments" });
    }
  });

  app.post("/api/admin/bank-installments", async (req, res) => {
    try {
      const installmentData = req.body;
      const newInstallment = await storage.createBankInstallment(installmentData);
      res.status(201).json(newInstallment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create installment option" });
    }
  });

  app.put("/api/admin/bank-installments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const result = await storage.updateBankInstallment(id, updates);
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "Installment option not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update installment option" });
    }
  });

  app.delete("/api/admin/bank-installments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBankInstallment(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Installment option not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete installment option" });
    }
  });

  // Bank Accounts Routes
  app.get("/api/admin/bank-accounts", async (req, res) => {
    try {
      const accounts = await storage.getBankAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      res.status(500).json({ error: "Failed to fetch bank accounts" });
    }
  });

  app.post("/api/admin/bank-accounts", async (req, res) => {
    try {
      const accountData = req.body;
      const newAccount = await storage.createBankAccount(accountData);
      res.status(201).json(newAccount);
    } catch (error) {
      console.error("Error creating bank account:", error);
      res.status(500).json({ error: "Failed to create bank account" });
    }
  });

  app.put("/api/admin/bank-accounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const result = await storage.updateBankAccount(id, updates);
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "Bank account not found" });
      }
    } catch (error) {
      console.error("Error updating bank account:", error);
      res.status(500).json({ error: "Failed to update bank account" });
    }
  });

  app.delete("/api/admin/bank-accounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBankAccount(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Bank account not found" });
      }
    } catch (error) {
      console.error("Error deleting bank account:", error);
      res.status(500).json({ error: "Failed to delete bank account" });
    }
  });

  // Payment Processing Routes
  app.post("/api/payment/virtual-pos/initiate", async (req, res) => {
    try {
      const { orderId, virtualPosConfigId, amount, installments = 1 } = req.body;
      const userId = (req.session as any).userId;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get virtual POS configuration
      const posConfig = await storage.getVirtualPosConfig(virtualPosConfigId);
      if (!posConfig || !posConfig.isActive) {
        return res.status(400).json({ error: "Invalid virtual POS configuration" });
      }

      // Create payment transaction record
      const transaction = await storage.createPaymentTransaction({
        orderId,
        userId,
        virtualPosConfigId,
        amount: amount.toString(),
        currency: posConfig.currency,
        status: "pending",
        threeDSecure: posConfig.posType.includes("3d"),
        installments,
        referenceNumber: `REF${Date.now()}`,
      });

      // Here you would integrate with the actual bank's virtual POS API
      // For now, we'll return a mock payment form URL
      const paymentFormUrl = `/api/payment/virtual-pos/form/${transaction.id}`;

      res.json({
        success: true,
        transactionId: transaction.id,
        paymentFormUrl,
        redirectUrl: paymentFormUrl
      });
    } catch (error) {
      console.error("Error initiating virtual POS payment:", error);
      res.status(500).json({ error: "Failed to initiate payment" });
    }
  });

  app.get("/api/payment/virtual-pos/form/:transactionId", async (req, res) => {
    try {
      const { transactionId } = req.params;
      
      // Get transaction details
      const transaction = await storage.getPaymentTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Get POS configuration
      const posConfig = await storage.getVirtualPosConfig(transaction.virtualPosConfigId);
      if (!posConfig) {
        return res.status(404).json({ error: "POS configuration not found" });
      }

      // Generate hash for Garanti BBVA 3D Secure (YENİ API!)
      const amount = parseFloat(transaction.amount);
      const orderId = transaction.referenceNumber;
      const installment = transaction.installments || 0;
      
      // Garanti BBVA 3D Secure API parametreleri
      const swtId = posConfig.terminalId; // Switch ID olarak terminal ID kullanıyoruz
      const switchPassword = posConfig.apiPassword; // 123456Aa*
      const txnType = 'sales';
      const txnAmount = amount.toString();
      const txnInstallmentCount = installment.toString();
      const txnTimestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14); // YYYYMMDDHHMMSS format
      const txnCurrencyCode = '949'; // TRY
      const successUrl = posConfig.successUrl;
      const failureUrl = posConfig.failUrl;
      
      // DOĞRU Garanti BBVA 3D Secure Hash Sırası (SHA256):
      // swtId & orderId & txnType & txnAmount & txnInstallmentCount & successUrl & failureUrl & txnTimestamp & txnCurrencyCode & Switch_Password
      const hashString = swtId + orderId + txnType + txnAmount + txnInstallmentCount + successUrl + failureUrl + txnTimestamp + txnCurrencyCode + switchPassword;
      
      const sha256Hash = createHash('sha256').update(hashString, 'utf8').digest('hex');
      const hashedData = sha256Hash.toUpperCase();

      // Debug log for troubleshooting  
      console.log('🏦 Garanti BBVA 3D Secure YENİ API:');
      console.log('Switch ID (swtId):', swtId);
      console.log('Order ID:', orderId);
      console.log('Txn Type:', txnType);
      console.log('Amount:', txnAmount);
      console.log('Installments:', txnInstallmentCount);
      console.log('Success URL:', successUrl);
      console.log('Failure URL:', failureUrl);
      console.log('Timestamp:', txnTimestamp);
      console.log('Currency Code:', txnCurrencyCode);
      console.log('Switch Password:', switchPassword);
      console.log('🔐 Hash String:', hashString);
      console.log('🔐 Generated SHA256 Hash:', hashedData);

      // Create form that posts to Garanti BBVA 3D Secure
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Garanti BBVA Güvenli Ödeme</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 30px; 
                    background: #f5f5f5; 
                }
                .payment-info { 
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .debug-info {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    text-align: left;
                    font-family: monospace;
                    font-size: 12px;
                }
                button { 
                    background: #007bff; 
                    color: white; 
                    border: none; 
                    padding: 15px 30px; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    font-size: 16px;
                }
                button:hover { background: #0056b3; }
                .auto-redirect {
                    color: #666;
                    font-size: 14px;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="payment-info">
                <h2>🏦 ${posConfig.bankName}</h2>
                <h3>Güvenli Ödeme Sayfası</h3>
                <p><strong>Tutar:</strong> ${(parseFloat(transaction.amount)).toFixed(2)} ${transaction.currency}</p>
                <p><strong>Taksit:</strong> ${installment} Ay</p>
            </div>

            <div class="debug-info">
                <strong>Debug Bilgileri:</strong><br>
                3D Secure URL: https://sanalposprov.garanti.com.tr/servlet/gt3dengine<br>
                Switch ID: ${swtId}<br>
                Order ID: ${orderId}<br>
                Amount: ${txnAmount}<br>
                Timestamp: ${txnTimestamp}<br>
                Hash: ${hashedData}
            </div>
            
            <form id="paymentForm" method="POST" action="https://sanalposprov.garanti.com.tr/servlet/gt3dengine">
                <input type="hidden" name="swtId" value="${swtId}">
                <input type="hidden" name="orderId" value="${orderId}">
                <input type="hidden" name="txnType" value="${txnType}">
                <input type="hidden" name="txnAmount" value="${txnAmount}">
                <input type="hidden" name="txnInstallmentCount" value="${txnInstallmentCount}">
                <input type="hidden" name="successUrl" value="${successUrl}">
                <input type="hidden" name="failureUrl" value="${failureUrl}">
                <input type="hidden" name="txnTimestamp" value="${txnTimestamp}">
                <input type="hidden" name="txnCurrencyCode" value="${txnCurrencyCode}">
                <input type="hidden" name="hashedData" value="${hashedData}">
                
                <button type="submit">🔐 Garanti BBVA'ya Git</button>
            </form>
            
            <div class="auto-redirect">
                <p>3 saniye içinde otomatik yönlendirileceksiniz...</p>
            </div>
            
            <script>
                // Auto-submit form after 3 seconds
                setTimeout(function() {
                    console.log('Auto-submitting to Garanti BBVA...');
                    document.getElementById('paymentForm').submit();
                }, 3000);
            </script>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("Error rendering payment form:", error);
      res.status(500).json({ error: "Failed to render payment form" });
    }
  });

  // Garanti BBVA 3D Secure Callback (POST)
  app.post("/api/payment/virtual-pos/callback", async (req, res) => {
    try {
      console.log('🏦 Garanti BBVA 3D Secure Callback Received:');
      console.log('Body:', req.body);
      console.log('Query:', req.query);
      
      // Garanti BBVA 3D Secure response parametreleri
      const {
        Response,         // Success: 00, Error: 05 
        Message,         // Response message
        OrderId,         // Our order ID
        AuthCode,        // Authorization code
        ProcReturnCode,  // Process return code
        TransId,         // Transaction ID from Garanti
        HostRefNum,      // Host reference number
        ErrMsg,          // Error message
        Hash             // Response hash for verification
      } = req.body;

      console.log('Response Code:', Response);
      console.log('Message:', Message);
      console.log('Order ID:', OrderId);
      console.log('Auth Code:', AuthCode);
      console.log('Proc Return Code:', ProcReturnCode);
      console.log('Trans ID:', TransId);
      console.log('Host Ref Num:', HostRefNum);
      console.log('Error Message:', ErrMsg);

      if (!OrderId) {
        console.error('❌ Order ID missing in callback');
        return res.redirect('/checkout?error=invalid_response');
      }

      // Check if payment was successful
      const isSuccess = Response === '00' && ProcReturnCode === '00';
      
      console.log('🎯 Payment Result:', isSuccess ? 'SUCCESS' : 'FAILED');

      if (isSuccess) {
        // Update order payment status directly using OrderId
        try {
          await storage.updateOrderStatus(OrderId, 'completed');
          console.log('✅ Order completed successfully:', OrderId);
        } catch (error) {
          console.error('❌ Error updating order status:', error);
        }
        
        // Send order confirmation email
        try {
          // Get order details with user and items
          const order = await storage.getOrder(OrderId);
          
          if (order && order.items && order.userId) {
            const user = await storage.getUser(order.userId);
            
            if (user?.email) {
              // Parse shipping address
              const shippingAddress = JSON.parse(order.shippingAddress);
              
              const success = await emailService.sendOrderConfirmationEmail(
                user.email,
                order,
                order.items,
                shippingAddress
              );
              
              if (success) {
                console.log('✅ Order confirmation email sent to:', user.email);
              } else {
                console.error('❌ Failed to send order confirmation email to:', user.email);
              }
            }
          }
        } catch (emailError) {
          console.error('❌ Error sending order confirmation email:', emailError);
        }
        res.redirect(`/order-confirmation?orderId=${OrderId}&status=success`);
      } else {
        console.log('❌ Payment failed:', ErrMsg || Message);
        res.redirect(`/checkout?error=payment_failed&message=${encodeURIComponent(ErrMsg || Message || 'Payment failed')}`);
      }
    } catch (error) {
      console.error("❌ Error handling Garanti BBVA callback:", error);
      res.redirect('/checkout?error=system_error');
    }
  });

  // GET endpoint for compatibility (fallback)
  app.get("/api/payment/virtual-pos/callback", async (req, res) => {
    try {
      console.log('🏦 GET Callback received (fallback)');
      console.log('Query params:', req.query);
      
      const { orderId, status, error } = req.query;
      
      if (orderId) {
        if (status === 'success') {
          res.redirect(`/order-confirmation?orderId=${orderId}&status=success`);
        } else {
          res.redirect(`/checkout?error=${error || 'payment_failed'}`);
        }
      } else {
        res.redirect('/checkout?error=invalid_callback');
      }
    } catch (error) {
      console.error("Error handling GET callback:", error);
      res.redirect('/checkout?error=system_error');
    }
  });

  // File upload endpoint - Object Storage ile kalıcı depolama
  app.post(
    "/api/admin/upload-image",
    upload.single("image"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Resim dosyası bulunamadı" });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = path.extname(req.file.originalname);
        const filename = `product-${timestamp}${fileExtension}`;

        // Object Storage kullanarak kalıcı depolama
        const { ObjectStorageService } = await import("./objectStorage");
        const objectStorageService = new ObjectStorageService();
        
        // Public klasöre yükle (herkes erişebilir)
        const publicDir = objectStorageService.getPublicObjectSearchPaths()[0];
        const objectPath = `${publicDir}/${filename}`;
        
        // Parse object path to get bucket and object name
        const pathParts = objectPath.split('/');
        const bucketName = pathParts[1];
        const objectName = pathParts.slice(2).join('/');
        
        // Upload to Object Storage
        const { objectStorageClient } = await import("./objectStorage");
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectName);
        
        // Upload file buffer directly
        await file.save(req.file.buffer, {
          metadata: {
            contentType: req.file.mimetype,
          },
        });

        // Return public URL that can be accessed via our endpoint
        const imageUrl = `/public-objects/${filename}`;

        console.log(`✅ Image uploaded to Object Storage: ${filename}`);
        console.log(`📁 Bucket: ${bucketName}, Object: ${objectName}`);
        console.log(`🌐 Public URL: ${imageUrl}`);
        
        res.json({ imageUrl });
      } catch (error) {
        console.error("❌ Error uploading image to Object Storage:", error);
        res.status(500).json({ error: "Resim yüklenirken hata oluştu" });
      }
    },
  );

  // Public object serving endpoint - Object Storage'dan görsel servis etme
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    try {
      const filePath = req.params.filePath;
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      
      console.log(`🔍 Looking for public object: ${filePath}`);
      
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        console.log(`❌ File not found: ${filePath}`);
        return res.status(404).json({ error: "File not found" });
      }
      
      console.log(`✅ Serving file: ${filePath}`);
      await objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("❌ Error serving public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin routes - Products
  app.get("/api/admin/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Arçelik.com'dan ürün bilgilerini çek
  app.post("/api/admin/scrape-product", async (req, res) => {
    try {
      const { productName } = req.body;
      
      if (!productName) {
        return res.status(400).json({ error: "Ürün adı gerekli" });
      }

      console.log(`🔍 Scraping product: ${productName}`);
      
      const { spawn } = await import('child_process').then(m => m.default || m);
      // Arçelik scraper - İstenen JSON formatında
      console.log('🚀 Using ARCELIK SCRAPER for:', productName);
      const pythonProcess = spawn('python3', ['server/arcelik_scraper.py', productName]);
      
      let output = '';
      let error = '';
      let isResponseSent = false;
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      pythonProcess.on('close', async (code) => {
        if (isResponseSent) return;
        isResponseSent = true;
        
        if (code !== 0) {
          console.error(`Python script error:`, error);
          return res.status(500).json({ error: "Scraping başarısız: " + (error || "Bilinmeyen hata") });
        }
        
        try {
          console.log('Raw Python output:', output);
          const cleanOutput = output.trim();
          
          if (!cleanOutput || cleanOutput.startsWith('<!DOCTYPE') || cleanOutput.startsWith('<html')) {
            return res.status(500).json({ error: "Ürün bulunamadı veya site erişim hatası" });
          }
          
          const productData = JSON.parse(cleanOutput);
          console.log(`✅ Product scraped successfully:`, productData.name || productData.error);
          
          // Resimleri object storage'a yükle
          if (productData.images && productData.images.length > 0) {
            console.log(`📸 Uploading ${productData.images.length} images to object storage...`);
            
            try {
              const uploadedImages = [];
              const { ObjectStorageService } = await import('./objectStorage.js');
              const objectStorage = new ObjectStorageService();
              
              // Resimler arası 500ms bekleme ve retry ile
              for (let i = 0; i < Math.min(productData.images.length, 4); i++) {
                const imageUrl = productData.images[i];
                
                // Resimler arası bekleme (rate limiting'i önlemek için)
                if (i > 0) {
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                let success = false;
                let retryCount = 0;
                const maxRetries = 3;
                
                while (!success && retryCount < maxRetries) {
                  try {
                    console.log(`📸 Downloading image ${i+1}/${productData.images.length} (attempt ${retryCount + 1})...`);
                    
                    // URL'ye göre farklı header stratejileri
                    let headers = {};
                    
                    if (imageUrl.includes('/media/resize/')) {
                      // Resize edilmiş resimler için minimal header'lar
                      headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                        'Referer': 'https://www.arcelik.com.tr/',
                        'Cache-Control': 'no-cache'
                      };
                    } else if (imageUrl.includes('/medias/')) {
                      // Medias klasörü için farklı header'lar
                      headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': '*/*',
                        'Accept-Language': 'tr-TR,tr;q=0.9',
                        'Referer': 'https://www.arcelik.com.tr/',
                        'Connection': 'keep-alive',
                        'Sec-Fetch-Dest': 'image',
                        'Sec-Fetch-Mode': 'no-cors',
                        'Sec-Fetch-Site': 'same-origin'
                      };
                    } else {
                      // Diğer URL'ler için genel header'lar
                      headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'image/*,*/*',
                        'Referer': 'https://www.arcelik.com.tr/'
                      };
                    }
                    
                    const imageResponse = await fetch(imageUrl, {
                      method: 'GET',
                      headers: headers,
                      signal: AbortSignal.timeout(15000) // 15 saniye timeout
                    });
                    
                    if (imageResponse.ok) {
                      const imageBuffer = await imageResponse.arrayBuffer();
                      
                      // Object storage'a yükle
                      const uploadUrl = await objectStorage.getObjectEntityUploadURL();
                      
                      const uploadResponse = await fetch(uploadUrl, {
                        method: 'PUT',
                        body: imageBuffer,
                        headers: {
                          'Content-Type': imageResponse.headers.get('content-type') || 'image/png',
                        }
                      });
                      
                      if (uploadResponse.ok) {
                        const objectPath = objectStorage.normalizeObjectEntityPath(uploadUrl);
                        uploadedImages.push(objectPath);
                        console.log(`✅ Image ${i+1} uploaded successfully: ${objectPath}`);
                        success = true;
                      } else {
                        console.error(`❌ Failed to upload image ${i+1}: ${uploadResponse.status}`);
                        retryCount++;
                      }
                    } else {
                      console.log(`❌ Failed to download image ${i+1}: ${imageResponse.status} (attempt ${retryCount + 1})`);
                      retryCount++;
                    }
                  } catch (imageError) {
                    console.error(`❌ Error processing image ${i+1} (attempt ${retryCount + 1}):`, imageError);
                    retryCount++;
                  }
                  
                  // Retry arasında bekleme
                  if (!success && retryCount < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                }
                
                if (!success) {
                  console.error(`❌ Failed to process image ${i+1} after ${maxRetries} attempts`);
                }
              }
              
              // Yüklenen resimleri data'ya ekle
              productData.uploadedImages = uploadedImages;
              // Ana images alanını da güncelle
              productData.images = uploadedImages;
              console.log(`📸 Successfully uploaded ${uploadedImages.length} images`);
              
            } catch (uploadError) {
              console.error('❌ Image upload error:', uploadError);
              productData.uploadedImages = [];
              productData.images = [];
            }
          } else {
            // Eğer resim yoksa boş array
            productData.images = [];
          }
          
          res.json(productData);
        } catch (parseError) {
          console.error(`JSON parse error:`, parseError, 'Output:', output);
          res.status(500).json({ error: "Veri işleme hatası - geçersiz format" });
        }
      });
      
      // 30 saniye timeout
      const timeout = setTimeout(() => {
        if (isResponseSent) return;
        isResponseSent = true;
        pythonProcess.kill();
        res.status(408).json({ error: "İşlem zaman aşımına uğradı" });
      }, 30000);
      
    } catch (error) {
      console.error("Error scraping product:", error);
      res.status(500).json({ error: "Scraping hatası" });
    }
  });

  app.post("/api/admin/products", async (req, res) => {
    try {
      const productData = req.body;
      const newProduct = await storage.createProduct(productData);

      // Broadcast real-time update to all connected clients
      if ((app as any).broadcastUpdate) {
        (app as any).broadcastUpdate("PRODUCT_CREATED", newProduct);
      }

      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res
        .status(500)
        .json({
          error:
            error instanceof Error ? error.message : "Failed to create product",
        });
    }
  });

  app.patch("/api/admin/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      console.log("Product update request:", {
        id,
        updates,
        originalPrice: updates.originalPrice,
        price: updates.price,
      });

      const updatedProduct = await storage.updateProduct(id, updates);

      console.log("Product update result:", updatedProduct);

      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Broadcast real-time update to all connected clients
      if ((app as any).broadcastUpdate) {
        console.log(
          "Broadcasting product update to all clients:",
          updatedProduct.id,
          updatedProduct.name,
        );
        (app as any).broadcastUpdate("PRODUCT_UPDATED", updatedProduct);
      } else {
        console.log("Broadcast function not available");
      }

      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Get product info before deletion for broadcasting
      const product = await storage.getProduct(id);

      const success = await storage.deleteProduct(id);

      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Broadcast real-time update to all connected clients
      if ((app as any).broadcastUpdate && product) {
        (app as any).broadcastUpdate("PRODUCT_DELETED", { id, product });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Generate product description from web scraping
  app.post("/api/admin/generate-description", async (req, res) => {
    try {
      const { productName } = req.body;
      
      if (!productName || productName.trim() === '') {
        return res.status(400).json({ error: "Ürün ismi gerekli" });
      }

      // Python script'i çağır
      const python = spawn('python3', ['server/web_scraper.py', productName]);
      
      let dataString = '';
      let errorString = '';

      python.stdout.on('data', (data: any) => {
        dataString += data.toString();
      });

      python.stderr.on('data', (data: any) => {
        errorString += data.toString();
      });

      python.on('close', (code: number) => {
        if (code !== 0) {
          console.error('Python script error:', errorString);
          return res.status(500).json({ 
            error: "Açıklama oluşturulurken hata oluştu",
            details: errorString 
          });
        }

        try {
          const result = JSON.parse(dataString.trim());
          res.json(result);
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'Data:', dataString);
          res.status(500).json({ 
            error: "Sonuç işlenirken hata oluştu",
            rawData: dataString 
          });
        }
      });

    } catch (error) {
      console.error("Generate description error:", error);
      res.status(500).json({ error: "Failed to generate description" });
    }
  });

  // Hero sections routes
  app.get("/api/admin/hero-sections", async (req, res) => {
    try {
      const heroSections = (storage as any).getHeroSections();
      res.json(heroSections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hero sections" });
    }
  });

  app.post("/api/admin/hero-sections", async (req, res) => {
    try {
      const hero = (storage as any).addHeroSection(req.body);
      res.status(201).json(hero);
    } catch (error) {
      res.status(500).json({ error: "Failed to add hero section" });
    }
  });

  app.patch("/api/admin/hero-sections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const hero = (storage as any).updateHeroSection(id, req.body);
      if (hero) {
        res.json(hero);
      } else {
        res.status(404).json({ error: "Hero section not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update hero section" });
    }
  });

  app.delete("/api/admin/hero-sections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = (storage as any).deleteHeroSection(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Hero section not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete hero section" });
    }
  });

  app.patch("/api/admin/navigation/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.updateNavigationItem(id, req.body);
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ error: "Navigation item not found" });
      }
    } catch (error) {
      console.error("Navigation update error:", error);
      res.status(500).json({ error: "Failed to update navigation item" });
    }
  });

  // Homepage sections routes
  app.get("/api/admin/homepage-sections", async (req, res) => {
    try {
      const sections = await storage.getHomepageSections();
      res.json(sections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch homepage sections" });
    }
  });

  app.put("/api/admin/homepage-sections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedSection = await storage.updateHomepageSection(id, updates);

      if (!updatedSection) {
        return res.status(404).json({ error: "Section not found" });
      }

      res.json(updatedSection);
    } catch (error) {
      res.status(500).json({ error: "Failed to update homepage section" });
    }
  });

  app.get("/api/homepage-sections/:sectionKey/products", async (req, res) => {
    try {
      const { sectionKey } = req.params;
      const sectionProducts = await storage.getHomepageProducts(sectionKey);
      res.json(sectionProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch section products" });
    }
  });

  app.post(
    "/api/admin/homepage-sections/:sectionId/products",
    async (req, res) => {
      try {
        const { sectionId } = req.params;
        const { productIds } = req.body;

        console.log(`Updating section ${sectionId} with products:`, productIds);

        if (!Array.isArray(productIds) || productIds.length > 4) {
          return res
            .status(400)
            .json({ error: "Must provide array of 1-4 product IDs" });
        }

        // Check if all products exist
        const allProducts = await storage.getProducts();
        const existingProductIds = allProducts.map((p) => p.id);
        const invalidIds = productIds.filter(
          (id) => !existingProductIds.includes(id),
        );

        if (invalidIds.length > 0) {
          console.log(
            "Invalid product IDs:",
            invalidIds,
            "Available:",
            existingProductIds,
          );
          return res.status(400).json({
            error: "Some products not found",
            invalidIds,
            availableProducts: allProducts.map((p) => ({
              id: p.id,
              name: p.name,
            })),
          });
        }

        // Update homepage products using DatabaseStorage
        const success = await storage.updateHomepageProducts(
          sectionId,
          productIds,
        );

        if (!success) {
          return res.status(404).json({ error: "Section not found" });
        }

        console.log(
          `Successfully updated section ${sectionId} with ${productIds.length} products`,
        );
        res.json({ success: true, message: "Products updated successfully" });
      } catch (error) {
        console.error("Error updating section products:", error);
        res
          .status(500)
          .json({ error: "Failed to update section products", details: error });
      }
    },
  );

  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // Store connected clients
  const connectedClients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    connectedClients.add(ws);
    console.log("WebSocket client connected");

    ws.on("close", () => {
      connectedClients.delete(ws);
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      connectedClients.delete(ws);
    });
  });

  // Function to broadcast updates to all connected clients
  const broadcastUpdate = (type: string, data: any) => {
    const message = JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString(),
    });
    console.log(
      `Broadcasting to ${connectedClients.size} clients:`,
      type,
      data.name || data.id,
    );

    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        console.log("Message sent to client");
      } else {
        console.log("Removing disconnected client");
        connectedClients.delete(client);
      }
    });
  };

  // Store broadcast function for use in routes
  (app as any).broadcastUpdate = broadcastUpdate;

  // Order routes
  app.get("/api/orders", async (req, res) => {
    if (!(req.session as any)?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const userId = (req.session as any).userId;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Failed to get orders" });
    }
  });

  // Get specific order by ID
  app.get("/api/orders/:id", async (req, res) => {
    if (!(req.session as any)?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const userId = (req.session as any).userId;
      const { id } = req.params;
      
      const order = await storage.getOrder(id);
      
      // Check if order exists and belongs to the user
      if (!order || order.userId !== userId) {
        return res.status(404).json({ error: "Sipariş bulunamadı" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ error: "Failed to get order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    if (!(req.session as any)?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const userId = (req.session as any).userId;
      const { totalAmount, shippingAddress, paymentMethod, cartItems } =
        req.body;

      const orderData = {
        userId,
        totalAmount: totalAmount.toString(),
        shippingAddress,
        paymentMethod: paymentMethod || "credit-card",
        status: paymentMethod === "bank-transfer" ? "pending" : "preparing",
        paymentStatus: paymentMethod === "bank-transfer" ? "pending" : "completed",
      };

      const orderItems = cartItems.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product?.price || "0",
        warranty: item.warranty,
      }));

      const order = await storage.createOrder(orderData, orderItems);
      
      // Send order confirmation email
      try {
        const user = await storage.getUser(userId);
        if (user?.email) {
          // Parse shipping address if it's a string
          const parsedShippingAddress = typeof shippingAddress === 'string' 
            ? JSON.parse(shippingAddress) 
            : shippingAddress;
            
          const success = await emailService.sendOrderConfirmationEmail(
            user.email,
            order,
            orderItems,
            parsedShippingAddress
          );
          
          if (success) {
            console.log('✅ Order confirmation email sent to:', user.email);
          } else {
            console.error('❌ Failed to send order confirmation email to:', user.email);
          }
        }
      } catch (emailError) {
        console.error('❌ Error sending order confirmation email:', emailError);
      }
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });


  // Admin Order Management Routes
  app.get("/api/admin/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Get admin orders error:", error);
      res.status(500).json({ error: "Failed to get orders" });
    }
  });

  app.put("/api/admin/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const validStatuses = ['preparing', 'ready_to_ship', 'shipped', 'in_transit', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      // Get the current order to get the old status for email notification
      const currentOrder = await storage.getOrder(id);
      if (!currentOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const oldStatus = currentOrder.status;
      
      const updatedOrder = await storage.adminUpdateOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Send order status update email
      try {
        const user = await storage.getUser(updatedOrder.userId);
        if (user?.email && oldStatus !== status) {
          const success = await emailService.sendOrderStatusUpdateEmail(
            user.email,
            updatedOrder,
            oldStatus,
            status
          );
          
          if (success) {
            console.log('✅ Order status update email sent to:', user.email);
          } else {
            console.error('❌ Failed to send order status update email to:', user.email);
          }
        }
      } catch (emailError) {
        console.error('❌ Error sending order status update email:', emailError);
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Admin tracking code update
  app.put("/api/admin/orders/:id/tracking", async (req, res) => {
    try {
      const { trackingCode } = req.body;
      const orderId = req.params.id;
      
      // Update tracking code
      const updatedOrder = await storage.updateOrderTrackingCode(orderId, trackingCode);
      
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Update tracking code error:", error);
      res.status(500).json({ error: "Failed to update tracking code" });
    }
  });

  // Admin Coupon Management Routes
  app.get("/api/admin/coupons", async (req, res) => {
    try {
      const coupons = await storage.getCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Get coupons error:", error);
      res.status(500).json({ error: "Failed to get coupons" });
    }
  });

  app.post("/api/admin/coupons", async (req, res) => {
    try {
      const {
        code,
        name,
        description,
        type,
        value,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        validFrom,
        validUntil,
        isActive
      } = req.body;
      
      // Veri tiplerini dönüştür
      const couponData = {
        code,
        name,
        description: description || "",
        type,
        value: value.toString(),
        minOrderAmount: minOrderAmount ? minOrderAmount.toString() : "0",
        maxDiscount: maxDiscount ? maxDiscount.toString() : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : 0,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: Boolean(isActive)
      };
      
      const coupon = await storage.createCoupon(couponData);
      res.status(201).json(coupon);
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        couponData: "undefined"
      };
      console.error("Create coupon error:", errorDetails);
      res.status(500).json({ 
        error: "Failed to create coupon", 
        details: errorDetails.message,
        sentData: errorDetails.couponData
      });
    }
  });

  app.put("/api/admin/coupons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const {
        code,
        name,
        description,
        type,
        value,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        validFrom,
        validUntil,
        isActive
      } = req.body;
      
      // Veri tiplerini güvenli dönüştür
      const updatedData: any = {};
      
      if (code) updatedData.code = code;
      if (name) updatedData.name = name;
      if (description !== undefined) updatedData.description = description;
      if (type) updatedData.type = type;
      if (value) updatedData.value = value.toString();
      if (minOrderAmount) updatedData.minOrderAmount = minOrderAmount.toString();
      if (maxDiscount) updatedData.maxDiscount = maxDiscount.toString();
      if (usageLimit !== undefined) updatedData.usageLimit = parseInt(usageLimit) || null;
      
      // Tarih alanları için güvenli dönüşüm
      if (validFrom !== undefined) {
        if (validFrom && typeof validFrom === 'string' && validFrom.trim() !== '') {
          const fromDate = new Date(validFrom);
          if (!isNaN(fromDate.getTime())) {
            updatedData.validFrom = fromDate;
          }
        }
        // Boş string gelirse hiçbir şey yapmayız (mevcut değeri koruruz)
      }
      
      if (validUntil !== undefined) {
        if (validUntil && typeof validUntil === 'string' && validUntil.trim() !== '') {
          const untilDate = new Date(validUntil);
          if (!isNaN(untilDate.getTime())) {
            updatedData.validUntil = untilDate;
          }
        } else if (validUntil === '' || validUntil === null) {
          updatedData.validUntil = null;
        }
      }
      
      if (isActive !== undefined) updatedData.isActive = Boolean(isActive);
      
      const coupon = await storage.updateCoupon(id, updatedData);
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error) {
      console.error("Update coupon error:", error);
      res.status(500).json({ error: "Failed to update coupon" });
    }
  });

  app.delete("/api/admin/coupons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCoupon(id);
      if (!success) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete coupon error:", error);
      res.status(500).json({ error: "Failed to delete coupon" });
    }
  });

  app.post("/api/coupons/validate/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const { orderAmount } = req.body;

      const coupon = await storage.validateCoupon(code, orderAmount);
      if (!coupon) {
        return res
          .status(400)
          .json({
            error: "Geçersiz kupon kodu veya kullanım koşulları sağlanmıyor.",
          });
      }

      res.json(coupon);
    } catch (error) {
      console.error("Validate coupon error:", error);
      res.status(500).json({ error: "Failed to validate coupon" });
    }
  });

  // General Settings Admin Routes
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getGeneralSettings();
      res.json(settings);
    } catch (error) {
      console.error("Get general settings error:", error);
      res.status(500).json({ error: "Failed to get general settings" });
    }
  });

  app.put("/api/admin/settings", async (req, res) => {
    try {
      const { 
        siteTitle, 
        siteDescription, 
        companyAddress, 
        contactPhone, 
        contactEmail, 
        instagramUrl, 
        whatsappUrl,
        bankName,
        accountHolder,
        iban,
        bankTransferInstructions
      } = req.body;
      
      const updatedSettings = await storage.updateGeneralSettings({
        siteTitle,
        siteDescription,
        companyAddress,
        contactPhone,
        contactEmail,
        instagramUrl,
        whatsappUrl,
        bankName,
        accountHolder,
        iban,
        bankTransferInstructions
      });
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Update general settings error:", error);
      res.status(500).json({ error: "Failed to update general settings" });
    }
  });

  // Corporate Content Admin Routes
  app.get("/api/admin/corporate-content", async (req, res) => {
    try {
      const content = await storage.getCorporateContent();
      res.json(content);
    } catch (error) {
      console.error("Get corporate content error:", error);
      res.status(500).json({ error: "Failed to get corporate content" });
    }
  });

  app.put("/api/admin/corporate-content", async (req, res) => {
    try {
      const updates = req.body;
      const updatedContent = await storage.updateCorporateContent(updates);
      res.json(updatedContent);
    } catch (error) {
      console.error("Update corporate content error:", error);
      res.status(500).json({ error: "Failed to update corporate content" });
    }
  });

  // Campaign Admin Routes
  app.get("/api/admin/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Get campaigns error:", error);
      res.status(500).json({ error: "Failed to get campaigns" });
    }
  });

  app.get("/api/admin/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Get campaign error:", error);
      res.status(500).json({ error: "Failed to get campaign" });
    }
  });

  app.post("/api/admin/campaigns", async (req, res) => {
    try {
      const { title, description, discount, endDate, image, category, isFeatured = false, sortOrder = 0, sendEmail = false } = req.body;
      
      const campaign = await storage.createCampaign({
        title,
        description,
        discount,
        endDate,
        image,
        category,
        isFeatured,
        sortOrder
      });
      
      // Send campaign email to all users if requested
      if (sendEmail) {
        // Don't await this to avoid blocking the response
        (async () => {
          try {
            console.log('📧 Starting to send campaign emails to all users...');
            
            // Get all users with verified email addresses
            const allUsers = await storage.getAllUsers();
            const verifiedUsers = allUsers.filter((user: any) => user.emailVerified);
            
            let sentCount = 0;
            let failedCount = 0;
            
            // Send emails in batches to avoid overwhelming the email service
            const batchSize = 10;
            for (let i = 0; i < verifiedUsers.length; i += batchSize) {
              const batch = verifiedUsers.slice(i, i + batchSize);
              
              const emailPromises = batch.map(async (user: { email: string }) => {
                try {
                  const success = await emailService.sendCampaignEmail(user.email, campaign);
                  if (success) {
                    sentCount++;
                  } else {
                    failedCount++;
                  }
                } catch (error) {
                  console.error(`Failed to send campaign email to ${user.email}:`, error);
                  failedCount++;
                }
              });
              
              // Wait for the current batch to complete before starting the next
              await Promise.all(emailPromises);
              
              // Small delay between batches to be respectful to email service
              if (i + batchSize < verifiedUsers.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
            
            console.log(`✅ Campaign email sending completed! Sent: ${sentCount}, Failed: ${failedCount}, Total: ${verifiedUsers.length}`);
          } catch (error) {
            console.error('❌ Error sending campaign emails:', error);
          }
        })();
      }
      
      res.json(campaign);
    } catch (error) {
      console.error("Create campaign error:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.put("/api/admin/campaigns/:id", async (req, res) => {
    try {
      const updates = req.body;
      const updatedCampaign = await storage.updateCampaign(req.params.id, updates);
      
      if (!updatedCampaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Update campaign error:", error);
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  app.delete("/api/admin/campaigns/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCampaign(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete campaign error:", error);
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  // Campaign Settings Admin Routes
  app.get("/api/admin/campaign-settings", async (req, res) => {
    try {
      const settings = await storage.getCampaignSettings();
      res.json(settings);
    } catch (error) {
      console.error("Get campaign settings error:", error);
      res.status(500).json({ error: "Failed to get campaign settings" });
    }
  });

  app.put("/api/admin/campaign-settings", async (req, res) => {
    try {
      const updates = req.body;
      const updatedSettings = await storage.updateCampaignSettings(updates);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Update campaign settings error:", error);
      res.status(500).json({ error: "Failed to update campaign settings" });
    }
  });

  // Public Campaign Routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      const activeCampaigns = campaigns.filter(campaign => campaign.isActive);
      res.json(activeCampaigns);
    } catch (error) {
      console.error("Get campaigns error:", error);
      res.status(500).json({ error: "Failed to get campaigns" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign || !campaign.isActive) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Get campaign error:", error);
      res.status(500).json({ error: "Failed to get campaign" });
    }
  });

  app.get("/api/campaign-settings", async (req, res) => {
    try {
      const settings = await storage.getCampaignSettings();
      res.json(settings);
    } catch (error) {
      console.error("Get campaign settings error:", error);
      res.status(500).json({ error: "Failed to get campaign settings" });
    }
  });

  // Support ticket endpoints
  // Get support tickets (admin gets all, user gets their own)
  app.get("/api/support/tickets", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = sessionUserId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Admins can see all tickets, users only see their own
      const tickets = user.role === 'admin' 
        ? await storage.getSupportTickets()
        : await storage.getSupportTickets(userId);
      
      res.json(tickets);
    } catch (error) {
      console.error("Error getting support tickets:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get specific support ticket
  app.get("/api/support/tickets/:id", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const ticketId = req.params.id;
      const userId = sessionUserId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const ticket = await storage.getSupportTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      // Check if user has permission to view this ticket
      if (user.role !== 'admin' && ticket.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error getting support ticket:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create support ticket
  app.post("/api/support/tickets", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = sessionUserId;
      const ticketData = insertSupportTicketSchema.parse({ ...req.body, userId });
      
      const ticket = await storage.createSupportTicket(ticketData);
      
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: error.errors 
        });
      }
      
      console.error("Error creating support ticket:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update support ticket (admin only)
  app.patch("/api/support/tickets/:id", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const ticketId = req.params.id;
      const userId = sessionUserId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const updates = req.body;
      const ticket = await storage.updateSupportTicket(ticketId, updates);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error updating support ticket:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Assign ticket to admin
  app.post("/api/support/tickets/:id/assign", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const ticketId = req.params.id;
      const userId = sessionUserId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const ticket = await storage.assignTicketToAdmin(ticketId, userId);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error assigning ticket to admin:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get ticket messages
  app.get("/api/support/tickets/:id/messages", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const ticketId = req.params.id;
      const userId = sessionUserId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Check if user has permission to view this ticket
      const ticket = await storage.getSupportTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      if (user.role !== 'admin' && ticket.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const messages = await storage.getTicketMessages(ticketId);
      res.json(messages);
    } catch (error) {
      console.error("Error getting ticket messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create ticket message
  app.post("/api/support/tickets/:id/messages", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const ticketId = req.params.id;
      const userId = sessionUserId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Check if user has permission to reply to this ticket
      const ticket = await storage.getSupportTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      if (user.role !== 'admin' && ticket.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const messageData = insertSupportTicketMessageSchema.parse({
        ...req.body,
        ticketId,
        senderId: userId,
        senderType: user.role === 'admin' ? 'admin' : 'user'
      });
      
      const message = await storage.createTicketMessage(messageData);
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: error.errors 
        });
      }
      
      console.error("Error creating ticket message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin Support ticket routes
  app.get("/api/admin/support/tickets", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = sessionUserId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const tickets = await storage.getAllSupportTicketsWithUsers();
      res.json(tickets);
    } catch (error) {
      console.error("Get admin support tickets error:", error);
      res.status(500).json({ error: "Failed to get support tickets" });
    }
  });

  app.get("/api/admin/support/tickets/:ticketId/messages", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { ticketId } = req.params;
      const userId = sessionUserId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const messages = await storage.getTicketMessages(ticketId);
      res.json(messages);
    } catch (error) {
      console.error("Get admin support ticket messages error:", error);
      res.status(500).json({ error: "Failed to get support ticket messages" });
    }
  });

  // Contact messages - public endpoint for contact form
  app.post("/api/contact-messages", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      
      res.status(201).json({ 
        success: true,
        message: "İletişim formu başarıyla gönderildi" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: error.errors 
        });
      }
      
      console.error("Error creating contact message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin contact messages - get all messages
  app.get("/api/admin/contact-messages", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const userId = sessionUserId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Get contact messages error:", error);
      res.status(500).json({ error: "Failed to get contact messages" });
    }
  });

  // Admin contact messages - mark as read
  app.put("/api/admin/contact-messages/:id/read", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { id } = req.params;
      const userId = sessionUserId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const message = await storage.markContactMessageAsRead(id);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Mark contact message as read error:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Admin contact messages - add response
  app.put("/api/admin/contact-messages/:id/response", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { id } = req.params;
      const { response } = req.body;
      const userId = sessionUserId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      if (!response || response.trim() === '') {
        return res.status(400).json({ error: "Response is required" });
      }
      
      const message = await storage.addContactMessageResponse(id, response.trim());
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Add contact message response error:", error);
      res.status(500).json({ error: "Failed to add response" });
    }
  });

  app.post("/api/admin/support/tickets/:ticketId/messages", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId;
    if (!sessionUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { ticketId } = req.params;
      const { message } = req.body;
      const userId = sessionUserId;
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const messageData = insertSupportTicketMessageSchema.parse({
        message,
        ticketId,
        senderId: userId,
        senderType: 'admin'
      });

      const newMessage = await storage.createTicketMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: error.errors 
        });
      }
      console.error("Add admin support ticket message error:", error);
      res.status(500).json({ error: "Failed to add message" });
    }
  });

  app.patch("/api/admin/support/tickets/:ticketId/close", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { ticketId } = req.params;
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const updatedTicket = await storage.updateSupportTicket(ticketId, {
        status: "closed",
        updatedAt: new Date()
      });
      
      if (!updatedTicket) {
        return res.status(404).json({ error: "Support ticket not found" });
      }
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Close support ticket error:", error);
      res.status(500).json({ error: "Failed to close support ticket" });
    }
  });

  // Global error handling middleware (must be last)
  app.use((error: any, req: any, res: any, next: any) => {
    console.error('Global error handler:', error);
    
    // Don't reveal internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Girilen veriler geçersiz',
        ...(isDevelopment && { details: error.message })
      });
    }
    
    if (error.type === 'entity.too.large') {
      return res.status(413).json({
        error: 'Dosya boyutu çok büyük'
      });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'Dosya boyutu limiti aşıldı'
      });
    }
    
    // Generic error response
    res.status(500).json({
      error: 'Sunucu hatası oluştu',
      ...(isDevelopment && { details: error.message, stack: error.stack })
    });
  });

  // Category icons endpoints
  app.get("/api/category-icons", async (req, res) => {
    try {
      const icons = await storage.getCategoryIcons();
      res.json(icons);
    } catch (error) {
      console.error("Error fetching category icons:", error);
      res.status(500).json({ error: "Failed to fetch category icons" });
    }
  });

  app.get("/api/admin/category-icons", async (req, res) => {
    try {
      const icons = await storage.getCategoryIcons();
      res.json(icons);
    } catch (error) {
      console.error("Error fetching category icons:", error);
      res.status(500).json({ error: "Failed to fetch category icons" });
    }
  });

  app.post("/api/admin/category-icons", async (req, res) => {
    try {
      const validatedData = insertCategoryIconSchema.parse(req.body);
      const icon = await storage.createCategoryIcon(validatedData);
      res.json(icon);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating category icon:", error);
      res.status(500).json({ error: "Failed to create category icon" });
    }
  });

  app.put("/api/admin/category-icons/:id", async (req, res) => {
    try {
      const validatedData = insertCategoryIconSchema.partial().parse(req.body);
      const updated = await storage.updateCategoryIcon(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Category icon not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating category icon:", error);
      res.status(500).json({ error: "Failed to update category icon" });
    }
  });

  app.delete("/api/admin/category-icons/:id", async (req, res) => {
    try {
      const success = await storage.deleteCategoryIcon(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Category icon not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category icon:", error);
      res.status(500).json({ error: "Failed to delete category icon" });
    }
  });

  app.patch("/api/admin/category-icons/:id/toggle", async (req, res) => {
    try {
      const { isActive } = req.body;
      const updated = await storage.toggleCategoryIcon(req.params.id, isActive);
      if (!updated) {
        return res.status(404).json({ error: "Category icon not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error toggling category icon:", error);
      res.status(500).json({ error: "Failed to toggle category icon" });
    }
  });

  // Product Cards Routes
  app.get("/api/product-cards", async (req, res) => {
    try {
      const cards = await storage.getAllProductCards();
      // Filter active cards for public API
      const activeCards = cards.filter(card => card.isActive);
      res.json(activeCards);
    } catch (error) {
      console.error("Error fetching product cards:", error);
      res.status(500).json({ error: "Failed to fetch product cards" });
    }
  });

  app.get("/api/admin/product-cards", async (req, res) => {
    try {
      const cards = await storage.getAllProductCards();
      res.json(cards);
    } catch (error) {
      console.error("Error fetching product cards:", error);
      res.status(500).json({ error: "Failed to fetch product cards" });
    }
  });

  app.post("/api/admin/product-cards", async (req, res) => {
    try {
      const validatedData = insertProductCardSchema.parse(req.body);
      const card = await storage.createProductCard(validatedData);
      res.json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating product card:", error);
      res.status(500).json({ error: "Failed to create product card" });
    }
  });

  app.put("/api/admin/product-cards/:id", async (req, res) => {
    try {
      // Remove timestamp fields that shouldn't be updated manually
      const { createdAt, updatedAt, ...updateData } = req.body;
      
      const validatedData = insertProductCardSchema.partial().parse(updateData);
      const updated = await storage.updateProductCard(req.params.id, validatedData);
      if (!updated) {
        return res.status(404).json({ error: "Product card not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating product card:", error);
      res.status(500).json({ error: "Failed to update product card" });
    }
  });

  app.delete("/api/admin/product-cards/:id", async (req, res) => {
    try {
      const success = await storage.deleteProductCard(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product card not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product card:", error);
      res.status(500).json({ error: "Failed to delete product card" });
    }
  });

  // Product cards image upload endpoint
  app.post("/api/product-cards/upload", async (req, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getProductCardImageUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating product card upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Category icon upload endpoint
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getCategoryIconUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating category icon upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Slider image upload endpoint
  app.post("/api/sliders/upload", async (req, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getSliderImageUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating slider upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Serve public objects from object storage
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Extended warranty endpoints
  app.get("/api/extended-warranty/categories", async (req, res) => {
    try {
      const categories = await storage.getExtendedWarrantyCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting extended warranty categories:", error);
      res.status(500).json({ error: "Failed to get extended warranty categories" });
    }
  });

  app.get("/api/extended-warranty/category/:categoryName", async (req, res) => {
    try {
      const { categoryName } = req.params;
      const warranty = await storage.getExtendedWarrantyByCategory(decodeURIComponent(categoryName));
      if (!warranty) {
        return res.status(404).json({ error: "Warranty category not found" });
      }
      res.json(warranty);
    } catch (error) {
      console.error("Error getting extended warranty by category:", error);
      res.status(500).json({ error: "Failed to get extended warranty" });
    }
  });

  app.get("/api/extended-warranty/product/:category/:productName", async (req, res) => {
    try {
      const { category, productName } = req.params;
      const decodedCategory = decodeURIComponent(category);
      const decodedProductName = decodeURIComponent(productName);
      
      console.log(`[WARRANTY] Looking for product: "${decodedProductName}" in category: "${decodedCategory}"`);
      
      // Find the product in our database to get its subcategory
      const products = await storage.getProducts();
      const product = products.find(p => p.name === decodedProductName && p.category === decodedCategory);
      
      console.log(`[WARRANTY] Product found:`, product ? `${product.name} - ${product.subcategory}` : 'NOT FOUND');
      
      if (!product || !product.subcategory) {
        return res.status(404).json({ error: "Warranty not available - product subcategory not specified" });
      }
      
      // Split subcategory if it's comma-separated
      const productSubcategories = product.subcategory.split(',').map(s => s.trim());
      
      // Get all warranties and their mappings
      const allWarranties = await storage.getExtendedWarrantyCategories();
      
      // Find a warranty that has a mapping for this product
      let applicableWarranty = null;
      
      console.log(`[WARRANTY] Checking ${allWarranties.length} warranties for mappings`);
      
      for (const warranty of allWarranties) {
        const mappings = await storage.getWarrantyCategoryMappings(warranty.id);
        console.log(`[WARRANTY] Warranty "${warranty.categoryName}" has ${mappings.length} mappings`);
        
        // Check if any mapping matches this product
        const hasValidMapping = mappings.some(mapping => {
          console.log(`[WARRANTY] Checking mapping: category="${mapping.productCategory}", subcategory="${mapping.productSubcategory}"`);
          // If mapping covers all subcategories (null or "ALL_SUBCATEGORIES")
          if (!mapping.productSubcategory || mapping.productSubcategory === "ALL_SUBCATEGORIES") {
            const matches = mapping.productCategory === decodedCategory;
            console.log(`[WARRANTY] All subcategories check: ${matches}`);
            return matches;
          }
          // Check if any product subcategory matches mapping subcategory
          const matches = mapping.productCategory === decodedCategory && 
                 productSubcategories.includes(mapping.productSubcategory);
          console.log(`[WARRANTY] Specific subcategory check: ${matches}`);
          return matches;
        });
        
        if (hasValidMapping) {
          applicableWarranty = warranty;
          console.log(`[WARRANTY] Found applicable warranty: ${warranty.categoryName}`);
          break;
        }
      }
      
      if (!applicableWarranty) {
        return res.status(404).json({ error: "Warranty not available for this product" });
      }
      
      // Additional product-specific exclusions
      const productLower = decodedProductName.toLowerCase();
      if (decodedCategory.toLowerCase() === 'ankastre' && productLower.includes('mikrodalga')) {
        return res.status(404).json({ error: "Warranty not available for this product" });
      }
      
      res.json(applicableWarranty);
    } catch (error) {
      console.error("Error getting extended warranty by product:", error);
      res.status(500).json({ error: "Failed to get extended warranty" });
    }
  });

  // Admin warranty management endpoints  
  app.get("/api/admin/extended-warranty/categories", async (req, res) => {
    try {
      const categories = await storage.getExtendedWarrantyCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting extended warranty categories:", error);
      res.status(500).json({ error: "Failed to get extended warranty categories" });
    }
  });

  app.put("/api/admin/extended-warranty/categories/:categoryName", async (req, res) => {
    try {
      const { categoryName } = req.params;
      const { twoYearPrice, fourYearPrice } = req.body;
      
      const updatedWarranty = await storage.updateExtendedWarrantyCategory(categoryName, {
        twoYearPrice: parseFloat(twoYearPrice),
        fourYearPrice: parseFloat(fourYearPrice)
      });
      
      if (!updatedWarranty) {
        return res.status(404).json({ error: "Warranty category not found" });
      }
      
      res.json(updatedWarranty);
    } catch (error) {
      console.error("Error updating extended warranty category:", error);
      res.status(500).json({ error: "Failed to update extended warranty category" });
    }
  });

  app.post("/api/admin/extended-warranty/categories", async (req, res) => {
    try {
      const { categoryName, twoYearPrice, fourYearPrice } = req.body;
      
      const newWarranty = await storage.createExtendedWarrantyCategory({
        categoryName,
        twoYearPrice: parseFloat(twoYearPrice),
        fourYearPrice: parseFloat(fourYearPrice)
      });
      
      res.json(newWarranty);
    } catch (error) {
      console.error("Error creating extended warranty category:", error);
      res.status(500).json({ error: "Failed to create extended warranty category" });
    }
  });

  // Warranty category mappings endpoints
  app.get("/api/admin/extended-warranty/categories/:categoryId/mappings", async (req, res) => {
    try {
      const { categoryId } = req.params;
      
      // Find the warranty category by name to get its database ID
      const warranties = await storage.getExtendedWarrantyCategories();
      const warranty = warranties.find(w => w.categoryName === decodeURIComponent(categoryId));
      
      if (!warranty) {
        return res.status(404).json({ error: "Warranty category not found" });
      }
      
      const mappings = await storage.getWarrantyCategoryMappings(warranty.id);
      res.json(mappings);
    } catch (error) {
      console.error("Error getting warranty category mappings:", error);
      res.status(500).json({ error: "Failed to get warranty category mappings" });
    }
  });

  app.post("/api/admin/extended-warranty/categories/:categoryId/mappings", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { productCategory, productSubcategories } = req.body;
      
      // First, find the warranty category by name to get its database ID
      const warranties = await storage.getExtendedWarrantyCategories();
      const warranty = warranties.find(w => w.categoryName === decodeURIComponent(categoryId));
      
      if (!warranty) {
        return res.status(404).json({ error: "Warranty category not found" });
      }
      
      // Handle both single subcategory and multiple subcategories
      const subcategoriesToAdd = productSubcategories && productSubcategories.length > 0 
        ? productSubcategories 
        : ["ALL_SUBCATEGORIES"];
      
      const mappings = [];
      
      // Create a mapping for each subcategory
      for (const subcategory of subcategoriesToAdd) {
        const mapping = await storage.addWarrantyCategoryMapping({
          warrantyCategoryId: warranty.id,
          productCategory,
          productSubcategory: subcategory === "ALL_SUBCATEGORIES" ? null : subcategory
        });
        mappings.push(mapping);
      }
      
      res.json(mappings);
    } catch (error) {
      console.error("Error adding warranty category mapping:", error);
      res.status(500).json({ error: "Failed to add warranty category mapping" });
    }
  });

  app.delete("/api/admin/extended-warranty/mappings/:mappingId", async (req, res) => {
    try {
      const { mappingId } = req.params;
      const success = await storage.deleteWarrantyCategoryMapping(mappingId);
      
      if (!success) {
        return res.status(404).json({ error: "Warranty category mapping not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting warranty category mapping:", error);
      res.status(500).json({ error: "Failed to delete warranty category mapping" });
    }
  });

  app.get("/api/admin/product-categories", async (req, res) => {
    try {
      const categories = await storage.getAllProductCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting product categories:", error);
      res.status(500).json({ error: "Failed to get product categories" });
    }
  });

  // SEO Endpoints
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const products = await storage.getProducts();
      
      const baseUrl = process.env.NODE_ENV === 'production' ? "https://enderoutlet.com" : "http://localhost:5000";
      const currentDate = new Date().toISOString().split('T')[0];
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Ana Sayfa -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Ürünler Sayfası -->
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Kategori Sayfaları -->
  <url>
    <loc>${baseUrl}/category/beyaz-esya</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/category/isitma-sogutma</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/category/ankastre</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Kurumsal Sayfalar -->
  <url>
    <loc>${baseUrl}/corporate</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/campaigns</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

      // Ürün sayfalarını ekle
      products.forEach((product) => {
        sitemap += `
  
  <!-- Ürün: ${product.name} -->
  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;
      
      if (product.image) {
        sitemap += `
    <image:image>
      <image:loc>${baseUrl}${product.image}</image:loc>
      <image:title>${product.name}</image:title>
      <image:caption>${product.description ? product.description.substring(0, 100) : product.name}</image:caption>
    </image:image>`;
      }
      
      sitemap += `
  </url>`;
      });

      sitemap += `
  
</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
      
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // SEO Settings API Endpoints
  app.get("/api/admin/seo-settings", async (req, res) => {
    try {
      const { pageType, pageId } = req.query;
      const settings = await storage.getSeoSettings(
        pageType as string,
        pageId as string
      );
      res.json(settings);
    } catch (error) {
      console.error("Error getting SEO settings:", error);
      res.status(500).json({ error: "Failed to get SEO settings" });
    }
  });

  app.post("/api/admin/seo-settings", async (req, res) => {
    try {
      const seoSetting = await storage.createSeoSetting(req.body);
      res.json(seoSetting);
    } catch (error) {
      console.error("Error creating SEO setting:", error);
      res.status(500).json({ error: "Failed to create SEO setting" });
    }
  });

  app.put("/api/admin/seo-settings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateSeoSetting(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "SEO setting not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating SEO setting:", error);
      res.status(500).json({ error: "Failed to update SEO setting" });
    }
  });

  app.delete("/api/admin/seo-settings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSeoSetting(id);
      
      if (!success) {
        return res.status(404).json({ error: "SEO setting not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting SEO setting:", error);
      res.status(500).json({ error: "Failed to delete SEO setting" });
    }
  });

  // Bulk SEO Generation Endpoint
  app.post("/api/admin/seo-settings/bulk-generate", async (req, res) => {
    try {
      const { types } = req.body; // ['products', 'categories', 'blog_posts']
      const results = {
        products: 0,
        categories: 0,
        blog_posts: 0,
        errors: [] as string[]
      };

      if (!types || !Array.isArray(types)) {
        return res.status(400).json({ error: "Types array is required" });
      }

      // Generate SEO for products
      if (types.includes('products')) {
        console.log("Generating SEO for all products...");
        const products = await storage.getProducts();
        
        for (const product of products) {
          try {
            await storage.generateProductSeo(product);
            results.products++;
            console.log(`Generated SEO for product: ${product.name}`);
          } catch (error) {
            console.error(`Failed to generate SEO for product ${product.name}:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            results.errors.push(`Product ${product.name}: ${errorMessage}`);
          }
        }
      }

      // Generate SEO for categories
      if (types.includes('categories')) {
        console.log("Generating SEO for all categories...");
        const categoryData = await storage.getAllProductCategories();
        
        for (const { category, subcategories } of categoryData) {
          try {
            // Ana kategori için SEO
            await storage.generateCategorySeo(category);
            results.categories++;
            console.log(`Generated SEO for category: ${category}`);
            
            // Alt kategoriler için SEO
            for (const subcategory of subcategories) {
              await storage.generateCategorySeo(category, subcategory);
              results.categories++;
              console.log(`Generated SEO for subcategory: ${category} - ${subcategory}`);
            }
          } catch (error) {
            console.error(`Failed to generate SEO for category ${category}:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            results.errors.push(`Category ${category}: ${errorMessage}`);
          }
        }
      }

      // Generate SEO for blog posts
      if (types.includes('blog_posts')) {
        console.log("Generating SEO for all blog posts...");
        const blogPosts = await storage.getBlogPosts();
        
        for (const post of blogPosts) {
          try {
            let category;
            if (post.categoryId) {
              category = await storage.getBlogCategory(post.categoryId);
            }
            
            await storage.generateBlogPostSeo(post, category);
            results.blog_posts++;
            console.log(`Generated SEO for blog post: ${post.title}`);
          } catch (error) {
            console.error(`Failed to generate SEO for blog post ${post.title}:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            results.errors.push(`Blog post ${post.title}: ${errorMessage}`);
          }
        }
      }

      console.log("Bulk SEO generation completed:", results);
      res.json({
        success: true,
        message: "Bulk SEO generation completed",
        results
      });
    } catch (error) {
      console.error("Error in bulk SEO generation:", error);
      res.status(500).json({ error: "Failed to generate bulk SEO" });
    }
  });

  // Blog Categories API Endpoints
  app.get("/api/admin/blog-categories", async (req, res) => {
    try {
      const categories = await storage.getBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting blog categories:", error);
      res.status(500).json({ error: "Failed to get blog categories" });
    }
  });

  app.post("/api/admin/blog-categories", async (req, res) => {
    try {
      const category = await storage.createBlogCategory(req.body);
      res.json(category);
    } catch (error) {
      console.error("Error creating blog category:", error);
      res.status(500).json({ error: "Failed to create blog category" });
    }
  });

  app.put("/api/admin/blog-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateBlogCategory(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Blog category not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating blog category:", error);
      res.status(500).json({ error: "Failed to update blog category" });
    }
  });

  app.delete("/api/admin/blog-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBlogCategory(id);
      
      if (!success) {
        return res.status(404).json({ error: "Blog category not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting blog category:", error);
      res.status(500).json({ error: "Failed to delete blog category" });
    }
  });

  // Blog Posts API Endpoints
  app.get("/api/admin/blog-posts", async (req, res) => {
    try {
      const { status, categoryId } = req.query;
      const posts = await storage.getBlogPosts(
        status as string,
        categoryId as string
      );
      res.json(posts);
    } catch (error) {
      console.error("Error getting blog posts:", error);
      res.status(500).json({ error: "Failed to get blog posts" });
    }
  });

  app.get("/api/admin/blog-posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.getBlogPost(id);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error getting blog post:", error);
      res.status(500).json({ error: "Failed to get blog post" });
    }
  });

  app.post("/api/admin/blog-posts", async (req, res) => {
    try {
      const post = await storage.createBlogPost(req.body);
      
      // Otomatik SEO oluştur
      try {
        // Blog kategorisini al eğer varsa
        let category;
        if (post.categoryId) {
          category = await storage.getBlogCategory(post.categoryId);
        }
        
        await storage.generateBlogPostSeo(post, category);
        console.log(`Auto-generated SEO for blog post: ${post.title}`);
      } catch (seoError) {
        console.error("Failed to generate SEO for blog post:", seoError);
        // SEO hatası blog yazısı oluşturma işlemini engellemez
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.put("/api/admin/blog-posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateBlogPost(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.post("/api/admin/blog-posts/:id/publish", async (req, res) => {
    try {
      const { id } = req.params;
      const published = await storage.publishBlogPost(id);
      
      if (!published) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json(published);
    } catch (error) {
      console.error("Error publishing blog post:", error);
      res.status(500).json({ error: "Failed to publish blog post" });
    }
  });

  app.delete("/api/admin/blog-posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBlogPost(id);
      
      if (!success) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Blog Tags API Endpoints
  app.get("/api/admin/blog-tags", async (req, res) => {
    try {
      const tags = await storage.getBlogTags();
      res.json(tags);
    } catch (error) {
      console.error("Error getting blog tags:", error);
      res.status(500).json({ error: "Failed to get blog tags" });
    }
  });

  app.post("/api/admin/blog-tags", async (req, res) => {
    try {
      const tag = await storage.createBlogTag(req.body);
      res.json(tag);
    } catch (error) {
      console.error("Error creating blog tag:", error);
      res.status(500).json({ error: "Failed to create blog tag" });
    }
  });

  app.put("/api/admin/blog-tags/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateBlogTag(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Blog tag not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating blog tag:", error);
      res.status(500).json({ error: "Failed to update blog tag" });
    }
  });

  app.delete("/api/admin/blog-tags/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBlogTag(id);
      
      if (!success) {
        return res.status(404).json({ error: "Blog tag not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting blog tag:", error);
      res.status(500).json({ error: "Failed to delete blog tag" });
    }
  });

  // Blog Slider API Endpoints
  app.get("/api/admin/blog-sliders", async (req, res) => {
    try {
      const sliders = await storage.getBlogSliders();
      res.json(sliders);
    } catch (error) {
      console.error("Error getting blog sliders:", error);
      res.status(500).json({ error: "Failed to get blog sliders" });
    }
  });

  app.post("/api/admin/blog-sliders", async (req, res) => {
    try {
      const slider = await storage.createBlogSlider(req.body);
      res.json(slider);
    } catch (error) {
      console.error("Error creating blog slider:", error);
      res.status(500).json({ error: "Failed to create blog slider" });
    }
  });

  app.put("/api/admin/blog-sliders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateBlogSlider(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Blog slider not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating blog slider:", error);
      res.status(500).json({ error: "Failed to update blog slider" });
    }
  });

  app.delete("/api/admin/blog-sliders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBlogSlider(id);
      
      if (!success) {
        return res.status(404).json({ error: "Blog slider not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting blog slider:", error);
      res.status(500).json({ error: "Failed to delete blog slider" });
    }
  });

  app.put("/api/admin/blog-sliders/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const updated = await storage.toggleBlogSlider(id, isActive);
      
      if (!updated) {
        return res.status(404).json({ error: "Blog slider not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error toggling blog slider:", error);
      res.status(500).json({ error: "Failed to toggle blog slider" });
    }
  });

  // Frontend Blog Slider API
  app.get("/api/blog-sliders", async (req, res) => {
    try {
      const sliders = await storage.getBlogSliders();
      const activeSliders = sliders.filter(slider => slider.isActive);
      res.json(activeSliders);
    } catch (error) {
      console.error("Error getting active blog sliders:", error);
      res.status(500).json({ error: "Failed to get blog sliders" });
    }
  });

  // Public Blog API Endpoints (Frontend tarafı için)
  app.get("/api/blog", async (req, res) => {
    try {
      const { categoryId } = req.query;
      const posts = await storage.getBlogPosts("published", categoryId as string);
      res.json(posts);
    } catch (error) {
      console.error("Error getting published blog posts:", error);
      res.status(500).json({ error: "Failed to get blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post || post.status !== "published") {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      // Görüntülenme sayısını artır
      await storage.incrementViewCount(post.id);
      
      res.json(post);
    } catch (error) {
      console.error("Error getting blog post:", error);
      res.status(500).json({ error: "Failed to get blog post" });
    }
  });

  app.get("/api/blog-categories", async (req, res) => {
    try {
      const categories = await storage.getBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting blog categories:", error);
      res.status(500).json({ error: "Failed to get blog categories" });
    }
  });

  // Frontend-compatible blog endpoints
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      // Only return published posts for public API
      const publishedPosts = posts.filter(post => post.status === 'published');
      res.json(publishedPosts);
    } catch (error) {
      console.error("Error getting blog posts:", error);
      res.status(500).json({ error: "Failed to get blog posts" });
    }
  });

  app.get("/api/blog-posts/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post || post.status !== "published") {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error getting blog post:", error);
      res.status(500).json({ error: "Failed to get blog post" });
    }
  });

  app.post("/api/blog-posts/:id/view", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementViewCount(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing blog post views:", error);
      res.status(500).json({ error: "Failed to increment views" });
    }
  });

  app.get("/api/blog-tags", async (req, res) => {
    try {
      const tags = await storage.getBlogTags();
      res.json(tags);
    } catch (error) {
      console.error("Error getting blog tags:", error);
      res.status(500).json({ error: "Failed to get blog tags" });
    }
  });

  // Footer Links API Endpoints
  app.get("/api/admin/footer-links", async (req, res) => {
    try {
      const links = await storage.getFooterLinks();
      res.json(links);
    } catch (error) {
      console.error("Error getting footer links:", error);
      res.status(500).json({ error: "Failed to get footer links" });
    }
  });

  app.post("/api/admin/footer-links", async (req, res) => {
    try {
      const link = await storage.createFooterLink(req.body);
      res.json(link);
    } catch (error) {
      console.error("Error creating footer link:", error);
      res.status(500).json({ error: "Failed to create footer link" });
    }
  });

  app.put("/api/admin/footer-links/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateFooterLink(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Footer link not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating footer link:", error);
      res.status(500).json({ error: "Failed to update footer link" });
    }
  });

  app.delete("/api/admin/footer-links/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteFooterLink(id);
      
      if (!success) {
        return res.status(404).json({ error: "Footer link not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting footer link:", error);
      res.status(500).json({ error: "Failed to delete footer link" });
    }
  });

  // Public Footer Links API (Frontend için)
  app.get("/api/footer-links", async (req, res) => {
    try {
      const links = await storage.getFooterLinks();
      res.json(links);
    } catch (error) {
      console.error("Error getting public footer links:", error);
      res.status(500).json({ error: "Failed to get footer links" });
    }
  });

  // Returns API Endpoints
  // Kullanıcı iade talepleri listesi
  app.get("/api/returns", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const returns = await storage.getUserReturns(userId);
      res.json(returns);
    } catch (error) {
      console.error("Error getting user returns:", error);
      res.status(500).json({ error: "Failed to get returns" });
    }
  });

  // İade edilmiş ürün listesi (orderItemId'ler)
  app.get("/api/returns/order-items", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const returns = await storage.getUserReturns(userId);
      const orderItemIds = returns.map((ret: any) => ret.orderItem.id);
      res.json(orderItemIds);
    } catch (error) {
      console.error("Error getting returned order items:", error);
      res.status(500).json({ error: "Failed to get returned order items" });
    }
  });

  // Yeni iade talebi oluştur
  app.post("/api/returns", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { orderItemId } = req.body;
      
      // Bu ürün için zaten iade talebi var mı kontrol et
      const existingReturn = await storage.getReturnByOrderItem(orderItemId);
      if (existingReturn) {
        return res.status(409).json({ 
          error: "Bu ürün için zaten bir iade talebi bulunmaktadır" 
        });
      }

      const returnData = { ...req.body, userId };
      const newReturn = await storage.createReturn(returnData);
      res.status(201).json(newReturn);
    } catch (error) {
      console.error("Error creating return:", error);
      res.status(500).json({ error: "Failed to create return" });
    }
  });

  // Admin: Tüm iade talepleri
  app.get("/api/admin/returns", async (req, res) => {
    try {
      const returns = await storage.getAllReturns();
      res.json(returns);
    } catch (error) {
      console.error("Error getting all returns:", error);
      res.status(500).json({ error: "Failed to get returns" });
    }
  });

  // Admin: İade onaylama/reddetme
  app.put("/api/admin/returns/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      
      // Get the current return to access user and product information for email
      const currentReturn = await storage.getReturn(id);
      if (!currentReturn) {
        return res.status(404).json({ error: "Return not found" });
      }
      
      const updatedReturn = await storage.updateReturnStatus(id, status, adminNotes);
      
      if (!updatedReturn) {
        return res.status(404).json({ error: "Return not found" });
      }
      
      // Send email notification for return status change
      try {
        const user = await storage.getUser(updatedReturn.userId);
        const product = await storage.getProduct(updatedReturn.productId);
        
        if (user?.email) {
          let emailSent = false;
          
          if (status === 'approved') {
            emailSent = await emailService.sendReturnApprovedEmail(
              user.email,
              updatedReturn,
              product
            );
          } else if (status === 'rejected') {
            emailSent = await emailService.sendReturnRejectedEmail(
              user.email,
              updatedReturn,
              product,
              adminNotes || 'İade talebiniz incelendi ve reddedildi.'
            );
          }
          
          if (emailSent) {
            console.log('✅ Return status email sent to:', user.email);
          } else {
            console.error('❌ Failed to send return status email to:', user.email);
          }
        }
      } catch (emailError) {
        console.error('❌ Error sending return status email:', emailError);
      }
      
      res.json(updatedReturn);
    } catch (error) {
      console.error("Error updating return status:", error);
      res.status(500).json({ error: "Failed to update return status" });
    }
  });

  // Statistics routes for admin dashboard
  app.get("/api/admin/statistics/sales", async (req, res) => {
    try {
      const { period = 'monthly', startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const stats = await storage.getSalesStatistics(period as any, start, end);
      res.json(stats);
    } catch (error) {
      console.error("Error getting sales statistics:", error);
      res.status(500).json({ error: "Failed to get sales statistics" });
    }
  });

  app.get("/api/admin/statistics/users", async (req, res) => {
    try {
      const stats = await storage.getUserStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error getting user statistics:", error);
      res.status(500).json({ error: "Failed to get user statistics" });
    }
  });

  app.get("/api/admin/statistics/product-views", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const stats = await storage.getProductViewStatistics(Number(limit));
      res.json(stats);
    } catch (error) {
      console.error("Error getting product view statistics:", error);
      res.status(500).json({ error: "Failed to get product view statistics" });
    }
  });

  app.get("/api/admin/statistics/slider-clicks", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const stats = await storage.getSliderClickStatistics(Number(limit));
      res.json(stats);
    } catch (error) {
      console.error("Error getting slider click statistics:", error);
      res.status(500).json({ error: "Failed to get slider click statistics" });
    }
  });

  app.get("/api/admin/statistics/orders", async (req, res) => {
    try {
      const stats = await storage.getOrderStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error getting order statistics:", error);
      res.status(500).json({ error: "Failed to get order statistics" });
    }
  });

  // Record product view
  app.post("/api/statistics/product-view", async (req, res) => {
    try {
      const { productId, userId, ipAddress, userAgent, referrer } = req.body;
      const view = await storage.recordProductView(productId, userId, ipAddress, userAgent, referrer);
      res.json(view);
    } catch (error) {
      console.error("Error recording product view:", error);
      res.status(500).json({ error: "Failed to record product view" });
    }
  });

  // Record slider click
  app.post("/api/statistics/slider-click", async (req, res) => {
    try {
      const { sliderId, sliderType, userId, ipAddress, userAgent } = req.body;
      const click = await storage.recordSliderClick(sliderId, sliderType, userId, ipAddress, userAgent);
      res.json(click);
    } catch (error) {
      console.error("Error recording slider click:", error);
      res.status(500).json({ error: "Failed to record slider click" });
    }
  });

  // Public komisyon oranları endpoint'i - müşterilerin görebilmesi için
  app.get('/api/commission-rates', async (req, res) => {
    try {
      const installments = await storage.getAllBankInstallments();
      const virtualPosConfigs = await storage.getVirtualPosConfigs();
      
      // Sadece aktif installmentları göster
      const activeInstallments = installments.filter(installment => installment.isActive);
      
      // Virtual POS config bilgilerini ekle
      const commissionRates = activeInstallments.map(installment => {
        const posConfig = virtualPosConfigs.find((config: any) => config.id === installment.virtualPosConfigId);
        return {
          id: installment.id,
          virtualPosConfigId: installment.virtualPosConfigId,
          bankName: posConfig?.bankName || 'Bilinmeyen Banka',
          cardType: installment.cardType,
          installmentCount: installment.installmentCount,
          commissionRate: installment.commissionRate,
          minAmount: installment.minAmount
        };
      });
      
      res.json(commissionRates);
    } catch (error) {
      console.error('Error fetching commission rates:', error);
      res.status(500).json({ message: 'Failed to fetch commission rates' });
    }
  });

  // Popular Searches API - Popüler Aramalar
  app.get("/api/popular-searches", async (req, res) => {
    try {
      const searches = await storage.getPopularSearches();
      res.json(searches);
    } catch (error) {
      console.error("Error fetching popular searches:", error);
      res.status(500).json({ error: "Failed to fetch popular searches" });
    }
  });

  app.post("/api/popular-searches", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const validatedData = insertPopularSearchSchema.parse(req.body);
      const search = await storage.createPopularSearch(validatedData);
      res.status(201).json(search);
    } catch (error) {
      console.error("Error creating popular search:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create popular search" });
      }
    }
  });

  app.put("/api/popular-searches/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const validatedData = insertPopularSearchSchema.parse(req.body);
      const search = await storage.updatePopularSearch(req.params.id, validatedData);
      if (!search) {
        return res.status(404).json({ error: "Popular search not found" });
      }
      res.json(search);
    } catch (error) {
      console.error("Error updating popular search:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update popular search" });
      }
    }
  });

  app.delete("/api/popular-searches/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const success = await storage.deletePopularSearch(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Popular search not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting popular search:", error);
      res.status(500).json({ error: "Failed to delete popular search" });
    }
  });

  // Track popular search clicks
  app.post("/api/popular-searches/:id/click", async (req, res) => {
    try {
      await storage.incrementPopularSearchClick(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking popular search click:", error);
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  // Category Banners API - Kategori Banner'ları
  app.get("/api/category-banners", async (req, res) => {
    try {
      const banners = await storage.getCategoryBanners();
      res.json(banners);
    } catch (error) {
      console.error("Error fetching category banners:", error);
      res.status(500).json({ error: "Failed to fetch category banners" });
    }
  });

  // Get category banner by category name
  app.get("/api/category-banners/:categoryName", async (req, res) => {
    try {
      const banner = await storage.getCategoryBannerByName(req.params.categoryName);
      if (!banner) {
        return res.status(404).json({ error: "Category banner not found" });
      }
      res.json(banner);
    } catch (error) {
      console.error("Error fetching category banner:", error);
      res.status(500).json({ error: "Failed to fetch category banner" });
    }
  });

  // Add new category banner (admin only)
  app.post("/api/category-banners", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const validatedData = insertCategoryBannerSchema.parse(req.body);
      const banner = await storage.createCategoryBanner(validatedData);
      res.status(201).json(banner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating category banner:", error);
      res.status(500).json({ error: "Failed to create category banner" });
    }
  });

  // Update category banner (admin only)
  app.put("/api/category-banners/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const banner = await storage.updateCategoryBanner(req.params.id, req.body);
      if (!banner) {
        return res.status(404).json({ error: "Category banner not found" });
      }
      res.json(banner);
    } catch (error) {
      console.error("Error updating category banner:", error);
      res.status(500).json({ error: "Failed to update category banner" });
    }
  });

  // Delete category banner (admin only)
  app.delete("/api/category-banners/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const success = await storage.deleteCategoryBanner(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Category banner not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category banner:", error);
      res.status(500).json({ error: "Failed to delete category banner" });
    }
  });

  // File Upload API - Dosya yükleme
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Dosya yüklenmedi" });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `upload_${timestamp}_${randomString}${fileExtension}`;

      // Save file to uploads directory
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, req.file.buffer);

      // Return the URL
      const fileUrl = `/uploads/${fileName}`;
      
      res.json({ 
        success: true, 
        url: fileUrl,
        filename: fileName,
        originalName: req.file.originalname,
        size: req.file.size
      });
      
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Dosya yüklenirken bir hata oluştu" });
    }
  });

  // 404 handler for undefined API routes only - must be at the end
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: 'API endpoint bulunamadı',
      path: req.originalUrl
    });
  });

  return createServer(app);
}
