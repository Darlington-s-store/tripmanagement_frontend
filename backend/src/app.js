import express from 'express';
import 'express-async-errors';
import crypto from 'crypto';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { sanitizeOutput } from './utils/sanitizer.js';
import authRoutes from './routes/auth.js';
import tripsRoutes from './routes/trips.js';
import hotelsRoutes from './routes/hotels.js';
import bookingsRoutes from './routes/bookings.js';
import guidesRoutes from './routes/guides.js';
import reviewsRoutes from './routes/reviews.js';
import providerRoutes from './routes/provider.js';
import adminRoutes from './routes/admin.js';
import destinationsRoutes from './routes/destinations.js';
import transportRoutes from './routes/transport.js';
import flightsRoutes from './routes/flights.js';
import notificationsRoutes from './routes/notifications.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// CORS - Move to top for best preflight handling
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'X-Requested-With', 'Accept'],
}));

// Body parser & Cookies
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.JWT_SECRET || 'fallback-secret-for-cookies'));

// Security Middleware (after CORS)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "http://localhost:3001", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(xss());
app.use(hpp());

// Permissions Policy
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Request ID for tracking
app.use((req, res, next) => {
  req.id = crypto.randomUUID?.() || Math.random().toString(36).substring(2);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Auto-sanitizer for all JSON responses
const originalJson = app.response.json;
app.response.json = function (body) {
  if (body && typeof body === 'object') {
    if (body.success !== undefined && body.data !== undefined) {
      body.data = sanitizeOutput(body.data);
    } else {
      body = sanitizeOutput(body);
    }
  }
  return originalJson.call(this, body);
};

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Targeted Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login/forgot password attempts, please try again later',
  skipSuccessfulRequests: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// CSRF Protection Configuration
const isProduction = process.env.NODE_ENV === 'production';
const csrf = doubleCsrf({
  getSecret: () => process.env.JWT_SECRET || 'fallback-secret-for-csrf',
  cookieName: 'ps-csrf-secret',
  cookieOptions: {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction, // only require HTTPS in production; HTTP works in dev
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getSessionIdentifier: (req) => req.headers['user-agent'] || 'anonymous',
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

const { doubleCsrfProtection, generateCsrfToken: generateToken } = csrf;

// Endpoint to get CSRF token
app.get('/api/csrf-token', (req, res) => {
  try {
    const token = generateToken(req, res);
    res.json({ csrfToken: token });
  } catch (error) {
    console.error('Error in /api/csrf-token:', error);
    res.status(500).json({ success: false, message: 'Could not generate CSRF token', error: error.message });
  }
});

// Apply CSRF protection to all other API routes
app.use('/api', (req, res, next) => {
  doubleCsrfProtection(req, res, next);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/guides', guidesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/notifications', notificationsRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
