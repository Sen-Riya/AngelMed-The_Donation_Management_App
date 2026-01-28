// ============= DONATION ROUTES (donationRoutes.ts) =============
import express from 'express';
import {
  getAllDonations,
  getDonation,
  createDonation,
  updateDonation,
  deleteDonation,
  getDonationsByDonor,
  getDonationsByLifeMember,
  getDonationStats
} from '../controllers/donationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All donation routes are protected
router.use(authenticateToken);

// Statistics
router.get('/stats', getDonationStats);

// CRUD operations
router.get('/', getAllDonations);
router.get('/:id', getDonation);
router.post('/', createDonation);
router.put('/:id', updateDonation);
router.delete('/:id', deleteDonation);

// Get donations by donor or life member
router.get('/donor/:donorId', getDonationsByDonor);
router.get('/life-member/:lifeMemberId', getDonationsByLifeMember);

export default router;