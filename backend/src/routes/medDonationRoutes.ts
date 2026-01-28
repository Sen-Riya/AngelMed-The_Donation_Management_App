import express from 'express';
import {
  getAllMedicalDonations,
  getMedicalDonationById,
  getMedicalDonationsByDonor,
  getMedicalDonationsByStatus,
  getExpiringDonations,
  getExpiredDonations,
  createMedicalDonation,
  updateMedicalDonation,
  updateMedicalDonationStatus,
  deleteMedicalDonation,
  getMedicalDonationStats
} from '../controllers/medDonationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all medical donations
router.get('/', authenticateToken, getAllMedicalDonations);

// Get statistics
router.get('/stats', authenticateToken, getMedicalDonationStats);

// Get expiring donations
router.get('/expiring', authenticateToken, getExpiringDonations);

// Get expired donations
router.get('/expired', authenticateToken, getExpiredDonations);

// Get donations by status
router.get('/status/:status', authenticateToken, getMedicalDonationsByStatus);

// Get donations by donor
router.get('/donor/:donorId', authenticateToken, getMedicalDonationsByDonor);

// Get medical donation by ID
router.get('/:id', authenticateToken, getMedicalDonationById);

// Create new medical donation
router.post('/', authenticateToken, createMedicalDonation);

// Update medical donation
router.put('/:id', authenticateToken, updateMedicalDonation);

// Update donation status only
router.patch('/:id/status', authenticateToken, updateMedicalDonationStatus);

// Delete medical donation
router.delete('/:id', authenticateToken, deleteMedicalDonation);

export default router;