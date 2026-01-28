import api from './axios';

export interface DonationTrend {
  month: string;
  year: number;
  amount: number;
  count: number;
}

export interface TopDonor {
  id: number;
  name: string;
  donorType: string;
  totalAmount: number;
  donationCount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MemberGrowth {
  month: string;
  year: number;
  count: number;
  cumulative: number;
}

export interface DistributionImpact {
  totalClients: number;
  moneyDistributed: number;
  clientsHelpedByMoney: number;
  medicineDistributed: number;
  clientsHelpedByMedicine: number;
  equipmentDistributed: number;
  clientsHelpedByEquipment: number;
}

export interface MedicalDonationsStat {
  category: string;
  donationCount: number;
  totalQuantity: number;
  approvedCount: number;
  pendingCount: number;
  collectedCount: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  date: string;
}

export interface DonorTypeBreakdown {
  donorType: string;
  donorCount: number;
  totalAmount: number;
  donationCount: number;
}

export interface DistributionTrend {
  month: string;
  year: number;
  assistanceType: string;
  count: number;
  moneyAmount: number;
  itemQuantity: number;
}

export interface ClientStat {
  status: string;
  count: number;
}

export interface AnalyticsData {
  donationTrends: DonationTrend[];
  topDonors: TopDonor[];
  categoryBreakdown: CategoryBreakdown[];
  memberGrowth: MemberGrowth[];
  distributionImpact: DistributionImpact;
  medicalDonationsStats: MedicalDonationsStat[];
  recentActivities: RecentActivity[];
  donorTypeBreakdown: DonorTypeBreakdown[];
  distributionTrends: DistributionTrend[];
  clientStats: ClientStat[];
}

export interface DashboardSummary {
  totalDonations: {
    amount: number;
    count: number;
  };
  totalMembers: number;
  totalClients: number;
  pendingDonations: number;
  pendingMedicalDonations: number;
  thisMonthDistributions: {
    count: number;
    moneyDistributed: number;
  };
}

export const analyticsApi = {
  // Get comprehensive analytics
  getAll: async (timeRange: string = '6months'): Promise<{ 
    success: boolean; 
    data: AnalyticsData 
  }> => {
    const response = await api.get(`/analytics?timeRange=${timeRange}`);
    return response.data;
  },

  // Get dashboard summary
  getDashboard: async (): Promise<{ 
    success: boolean; 
    data: DashboardSummary 
  }> => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },
};