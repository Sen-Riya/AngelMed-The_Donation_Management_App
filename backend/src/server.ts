import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import donationRoutes from './routes/donationRoutes';
import memberRoutes from './routes/memberRoutes';
import clientRoutes from './routes/clientRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import medDonationRoutes from './routes/medDonationRoutes';
import distributionRoutes from './routes/distributionRoutes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5001;

// Request logging middleware - BEFORE CORS
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// CORS Configuration - MUST BE BEFORE ROUTES
const corsOptions = {
  origin: function (origin: any, callback: any) {
    console.log('Origin:', origin);
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || origin === 'http://localhost:5173') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/medical-donations', medDonationRoutes);
app.use('/api/distributions', distributionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.path);
  res.status(404).json({ message: 'Route not found' });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: http://localhost:5173`);
});