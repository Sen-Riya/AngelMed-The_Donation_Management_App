import { Request, Response } from 'express';
import * as dashboardModel from '../models/Dashboard';

const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  console.log('📊 Dashboard stats endpoint hit');
  
  try {
    // Fetch all statistics in parallel
    const [
      totalMonetaryDonations,
      currentMonthDonations,
      lastMonthDonations,
      totalMedicalDonations,
      lifeMembersCount,
      currentMonthMembers,
      activeClientsCount,
      currentWeekClients,
      recentMonetaryDonations,
      recentMedicalDonations
    ] = await Promise.all([
      dashboardModel.getTotalMonetaryDonations(),
      dashboardModel.getCurrentMonthMonetaryDonations(),
      dashboardModel.getLastMonthMonetaryDonations(),
      dashboardModel.getTotalMedicalDonationsCount(),
      dashboardModel.getLifeMembersCount(),
      dashboardModel.getCurrentMonthMembers(),
      dashboardModel.getActiveClientsCount(),
      dashboardModel.getCurrentWeekClients(),
      dashboardModel.getRecentMonetaryDonations(5),
      dashboardModel.getRecentMedicalDonations(3)
    ]);

    // Calculate percentage change for donations
    const donationChange = lastMonthDonations > 0
      ? ((currentMonthDonations - lastMonthDonations) / lastMonthDonations) * 100
      : 0;

    // Format recent monetary donations
    const formattedMonetaryDonations = recentMonetaryDonations.map(donation => ({
      id: donation.id,
      donorName: donation.donor_name,
      amount: parseFloat(donation.amount.toString()),
      date: donation.date,
      paymentMode: donation.payment_mode,
      purpose: donation.purpose,
      status: donation.status,
      isLifeMember: donation.donor_type === 'Life Member'
    }));

    // Format recent medical donations
    const formattedMedicalDonations = recentMedicalDonations.map(donation => ({
      id: donation.id,
      donorName: donation.donor_name,
      itemName: donation.item_name,
      category: donation.category,
      quantity: donation.quantity,
      strength: donation.strength,
      donationDate: donation.donation_date,
      status: donation.status,
      isLifeMember: donation.donor_type === 'Life Member'
    }));

    // Send response matching the frontend expectations
    res.status(200).json({
      success: true,
      data: {
        totalDonations: {
          amount: parseFloat(totalMonetaryDonations.toString()),
          percentageChange: Math.round(donationChange),
        },
        medicalDonations: {
          totalCount: totalMedicalDonations
        },
        lifeMembers: {
          total: lifeMembersCount,
          newThisMonth: currentMonthMembers,
        },
        activeClients: {
          total: activeClientsCount,
          newThisWeek: currentWeekClients,
        },
        recentDonations: formattedMonetaryDonations, // Frontend expects this key
        recentMedicalDonations: formattedMedicalDonations
      },
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export default getDashboardStats;
