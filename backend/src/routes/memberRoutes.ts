import express from 'express';
import {
  getAllMembers,
  getMember,
  createMember,
  updateMember,
  deactivateMember,
  deleteMember
} from '../controllers/memberController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All member routes are protected
router.use(authenticateToken);

// CRUD endpoints
router.get('/', getAllMembers);
router.get('/:id', getMember);
router.post('/', createMember);
router.put('/:id', updateMember);
router.patch('/:id/deactivate', deactivateMember); // Soft delete
router.delete('/:id', deleteMember); // Hard delete (use carefully)

export default router;