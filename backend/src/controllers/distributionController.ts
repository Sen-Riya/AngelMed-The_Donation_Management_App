
import { Request, Response } from 'express';
import * as DistributionModel from '../models/Distribution';

// Get all distributions with filters
export const getDistributions = async (req: Request, res: Response) => {
  try {
    const filters: DistributionModel.DistributionFilters = {
      client_id: req.query.client_id ? Number(req.query.client_id) : undefined,
      assistance_type: req.query.assistance_type as string,
      status: req.query.status as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      search: req.query.search as string
    };

    const distributions = await DistributionModel.getAllDistributions(filters);
    res.json(distributions);
  } catch (error) {
    console.error('Error fetching distributions:', error);
    res.status(500).json({ error: 'Failed to fetch distributions' });
  }
};

// Get single distribution by ID
export const getDistribution = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const distribution = await DistributionModel.getDistributionById(id);
    
    if (!distribution) {
      return res.status(404).json({ error: 'Distribution not found' });
    }
    
    res.json(distribution);
  } catch (error) {
    console.error('Error fetching distribution:', error);
    res.status(500).json({ error: 'Failed to fetch distribution' });
  }
};

// Get distributions by client ID
export const getDistributionsByClient = async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.clientId);
    const distributions = await DistributionModel.getDistributionsByClientId(clientId);
    res.json(distributions);
  } catch (error) {
    console.error('Error fetching client distributions:', error);
    res.status(500).json({ error: 'Failed to fetch client distributions' });
  }
};

// Create new distribution
export const createDistribution = async (req: Request, res: Response) => {
  try {
    const data: DistributionModel.CreateDistributionData = req.body;
    
    // Validation
    if (!data.client_id || !data.assistance_type || !data.assistance_date) {
      return res.status(400).json({ 
        error: 'Missing required fields: client_id, assistance_type, assistance_date' 
      });
    }

    // Validate assistance_type specific fields
    if (data.assistance_type === 'money' && !data.amount) {
      return res.status(400).json({ error: 'Amount is required for money assistance' });
    }

    if ((data.assistance_type === 'medicine' || data.assistance_type === 'equipment') && !data.quantity) {
      return res.status(400).json({ error: 'Quantity is required for medicine/equipment assistance' });
    }

    const distributionId = await DistributionModel.createDistribution(data);
    const distribution = await DistributionModel.getDistributionById(distributionId);
    
    res.status(201).json(distribution);
  } catch (error) {
    console.error('Error creating distribution:', error);
    res.status(500).json({ error: 'Failed to create distribution' });
  }
};

// Update distribution
export const updateDistribution = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data: DistributionModel.UpdateDistributionData = req.body;
    
    const success = await DistributionModel.updateDistribution(id, data);
    
    if (!success) {
      return res.status(404).json({ error: 'Distribution not found or no changes made' });
    }
    
    const distribution = await DistributionModel.getDistributionById(id);
    res.json(distribution);
  } catch (error) {
    console.error('Error updating distribution:', error);
    res.status(500).json({ error: 'Failed to update distribution' });
  }
};

// Update distribution status
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    
    if (!status || !['provided', 'pending', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be: provided, pending, or cancelled' 
      });
    }
    
    const success = await DistributionModel.updateDistributionStatus(id, status);
    
    if (!success) {
      return res.status(404).json({ error: 'Distribution not found' });
    }
    
    const distribution = await DistributionModel.getDistributionById(id);
    res.json(distribution);
  } catch (error) {
    console.error('Error updating distribution status:', error);
    res.status(500).json({ error: 'Failed to update distribution status' });
  }
};

// Delete distribution
export const deleteDistribution = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const success = await DistributionModel.deleteDistribution(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Distribution not found' });
    }
    
    res.json({ message: 'Distribution deleted successfully' });
  } catch (error) {
    console.error('Error deleting distribution:', error);
    res.status(500).json({ error: 'Failed to delete distribution' });
  }
};

// Get distribution statistics
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await DistributionModel.getDistributionStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching distribution stats:', error);
    res.status(500).json({ error: 'Failed to fetch distribution stats' });
  }
};
