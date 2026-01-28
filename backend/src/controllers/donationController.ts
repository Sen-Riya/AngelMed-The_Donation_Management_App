import { Request, Response } from 'express';
import DonationModel from '../models/Donation';

// Get all donations
export const getAllDonations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, startDate, endDate, donorType, limit = '50', offset = '0' } = req.query;

    const filters = {
      status: status as string,
      search: search as string,
      startDate: startDate as string,
      endDate: endDate as string,
      donorType: donorType as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };

    const donations = await DonationModel.findAll(filters);

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get single donation
export const getDonation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const donation = await DonationModel.findById(parseInt(id));

    if (!donation) {
      res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create donation
export const createDonation = async (req: Request, res: Response): Promise<void> => {
  try {
    const donationData = req.body;

    // Validate required fields
    if (!donationData.amount || !donationData.date || !donationData.payment_mode || !donationData.purpose) {
      res.status(400).json({ 
        success: false,
        message: 'Missing required fields: amount, date, payment_mode, purpose' 
      });
      return;
    }

    if (!donationData.donor_id && !donationData.donor_name) {
      res.status(400).json({
        success: false,
        message: 'Either donor_id or donor_name must be provided'
      });
      return;
    }

    const donationId = await DonationModel.create(donationData);
    const newDonation = await DonationModel.findById(donationId);

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: newDonation
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create donation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update donation
export const updateDonation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await DonationModel.update(parseInt(id), updateData);

    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Donation not found or no fields to update'
      });
      return;
    }

    const updatedDonation = await DonationModel.findById(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      data: updatedDonation
    });
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update donation', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete donation
export const deleteDonation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await DonationModel.delete(parseInt(id));

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete donation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get donations by donor
export const getDonationsByDonor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { donorId } = req.params;
    const donations = await DonationModel.findByDonorId(parseInt(donorId));

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    console.error('Error fetching donations by donor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get donations by life member
export const getDonationsByLifeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lifeMemberId } = req.params;
    const result = await DonationModel.findByLifeMemberId(parseInt(lifeMemberId));

    res.status(200).json({
      success: true,
      count: result.donations.length,
      lifeMemberId: parseInt(lifeMemberId),
      donorId: result.donorId,
      data: result.donations
    });
  } catch (error) {
    console.error('Error fetching donations by life member:', error);
    
    if (error instanceof Error && error.message === 'Life member not found') {
      res.status(404).json({
        success: false,
        message: 'Life member not found'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get donation statistics
export const getDonationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, year } = req.query;
    
    const stats = await DonationModel.getStats(
      month ? parseInt(month as string) : undefined,
      year ? parseInt(year as string) : undefined
    );

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
