import express from 'express';
import { getAnalytics, getDashboardSummary } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// IMPORTANT: Specific routes MUST come before general routes
// Otherwise '/dashboard' will match '/' with param 'dashboard'

// Get quick dashboard summary - MUST be before '/' route
router.get('/dashboard', authenticateToken, getDashboardSummary);

// Get comprehensive analytics with optional time range query parameter
// Example: /analytics?timeRange=6months
router.get('/', authenticateToken, getAnalytics);

export default router;