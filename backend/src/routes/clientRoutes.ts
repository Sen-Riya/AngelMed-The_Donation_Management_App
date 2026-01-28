import express from 'express';
import {
  getAllClients,
  getClient,
  createClient,
  updateClient,
  deactivateClient,
  deleteClient
} from '../controllers/clientController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All client routes are protected
router.use(authenticateToken);

// CRUD endpoints
router.get('/', getAllClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.put('/:id', updateClient);
router.patch('/:id/deactivate', deactivateClient); // Soft delete
router.delete('/:id', deleteClient); // Hard delete (use carefully)

export default router;
