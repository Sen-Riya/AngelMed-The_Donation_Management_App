import { Request, Response } from 'express';
import * as medDonationModel from '../models/MedDonation';

// Get all medical donations
export const getAllMedicalDonations = async (req: Request, res: Response): Promise<void> => {
  try {
    const donations = await medDonationModel.getAllMedicalDonations();
    res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('❌ Error fetching medical donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical donations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get medical donation by ID
export const getMedicalDonationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const donation = await medDonationModel.getMedicalDonationById(id);
    
    if (!donation) {
      res.status(404).json({
        success: false,
        message: 'Medical donation not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('❌ Error fetching medical donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical donation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get donations by donor
export const getMedicalDonationsByDonor = async (req: Request, res: Response): Promise<void> => {
  try {
    const donorId = parseInt(req.params.donorId);
    const donations = await medDonationModel.getMedicalDonationsByDonor(donorId);
    
    res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('❌ Error fetching donor donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donor donations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get donations by status
export const getMedicalDonationsByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.params.status;
    const donations = await medDonationModel.getMedicalDonationsByStatus(status);
    
    res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('❌ Error fetching donations by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations by status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get expiring donations
export const getExpiringDonations = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const donations = await medDonationModel.getExpiringDonations(days);
    
    res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('❌ Error fetching expiring donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring donations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get expired donations
export const getExpiredDonations = async (req: Request, res: Response): Promise<void> => {
  try {
    const donations = await medDonationModel.getExpiredDonations();
    
    res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('❌ Error fetching expired donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expired donations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create new medical donation - UPDATED to handle donor_name
export const createMedicalDonation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { donor_id, donor_name, item_name, category, strength, quantity, expiry_date, status } = req.body;

    console.log('Create medical donation request:', req.body);

    // Validation - either donor_id or donor_name must be provided
    if (!donor_id && !donor_name) {
      res.status(400).json({
        success: false,
        message: 'Either donor_id or donor_name is required'
      });
      return;
    }

    if (!item_name || !category || !quantity) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: item_name, category, quantity'
      });
      return;
    }

    // Validate category-specific requirements
    if ((category === 'Medicine' || category === 'Supplement') && !strength) {
      res.status(400).json({
        success: false,
        message: 'Strength is required for Medicine and Supplement categories'
      });
      return;
    }

    const donationId = await medDonationModel.createMedicalDonation({
      donor_id,
      donor_name,
      item_name,
      category,
      strength: category === 'Equipment' ? null : strength,
      quantity,
      expiry_date: category === 'Equipment' ? null : expiry_date,
      status
    });

    const newDonation = await medDonationModel.getMedicalDonationById(donationId);

    res.status(201).json({
      success: true,
      message: 'Medical donation created successfully',
      data: newDonation
    });
  } catch (error) {
    console.error('❌ Error creating medical donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create medical donation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update medical donation
export const updateMedicalDonation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    console.log('Update medical donation request:', { id, updateData });

    const success = await medDonationModel.updateMedicalDonation(id, updateData);

    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Medical donation not found or no changes made'
      });
      return;
    }

    const updatedDonation = await medDonationModel.getMedicalDonationById(id);

    res.status(200).json({
      success: true,
      message: 'Medical donation updated successfully',
      data: updatedDonation
    });
  } catch (error) {
    console.error('❌ Error updating medical donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medical donation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update donation status
export const updateMedicalDonationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required'
      });
      return;
    }

    const success = await medDonationModel.updateMedicalDonationStatus(id, status);

    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Medical donation not found'
      });
      return;
    }

    const updatedDonation = await medDonationModel.getMedicalDonationById(id);

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: updatedDonation
    });
  } catch (error) {
    console.error('❌ Error updating donation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update donation status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete medical donation
export const deleteMedicalDonation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const success = await medDonationModel.deleteMedicalDonation(id);

    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Medical donation not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Medical donation deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting medical donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete medical donation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get statistics
export const getMedicalDonationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await medDonationModel.getMedicalDonationStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching donation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};