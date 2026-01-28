
import express from 'express';
import * as distributionController from '../controllers/distributionController';

const router = express.Router();

// Get all distributions (with optional filters)
router.get('/', distributionController.getDistributions);

// Get distribution statistics
router.get('/stats', distributionController.getStats);

// Get distributions by client ID
router.get('/client/:clientId', distributionController.getDistributionsByClient);

// Get single distribution by ID
router.get('/:id', distributionController.getDistribution);

// Create new distribution
router.post('/', distributionController.createDistribution);

// Update distribution
router.put('/:id', distributionController.updateDistribution);

// Update distribution status
router.patch('/:id/status', distributionController.updateStatus);

// Delete distribution
router.delete('/:id', distributionController.deleteDistribution);

export default router;