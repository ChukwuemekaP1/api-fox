const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    const retryAfter = Math.ceil(req.rateLimit.resetTime / 1000);
    res.set('Retry-After', retryAfter);
    res.status(429).json({
      message: 'Too many requests, please try again later.',
      retryAfter: retryAfter
    });
  }
});

// Stricter auth rate limiter: 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(req.rateLimit.resetTime / 1000);
    res.set('Retry-After', retryAfter);
    res.status(429).json({
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: retryAfter
    });
  }
});

// Apply global rate limiter to all requests
app.use(globalLimiter);

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [];
const { sendSuccess } = require('./utils/response');
const { getLoggerStream } = require('./utils/logger');
const authRoutes = require('./routes/auth.routes');
const protectedRoutes = require('./routes/protected.routes');

const app = express();

const allowedOrigins =
  process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [];

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  })
);
app.use(helmet());

// Determine logging format based on environment
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: getLoggerStream() }));

app.get('/api/health', (req, res) => {
  sendSuccess(res, { status: 'ok' }, 200, 'Server is healthy');
});

// Apply stricter rate limiter to auth routes
app.use('/api/auth', authLimiter);

// Example auth routes (for testing rate limiting)
app.post('/api/auth/login', (req, res) => {
  res.status(200).json({ message: 'Login endpoint' });
});

app.post('/api/auth/register', (req, res) => {
  res.status(200).json({ message: 'Register endpoint' });
});

module.exports = app;
// Auth routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/protected', protectedRoutes);

// Global error handling middleware - must be registered last
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;
