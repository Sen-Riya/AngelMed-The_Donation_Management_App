import express from 'express';
import getDashboardStats from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/stats', authenticateToken, getDashboardStats);

export default router;