import api from './axios';

export interface DashboardStats {
  totalDonations: {
    amount: number;
    percentageChange: number;
  };
  medicalDonations: {
    totalCount: number;
  };
  lifeMembers: {
    total: number;
    newThisMonth: number;
  };
  activeClients: {
    total: number;
    newThisWeek: number;
  };
  recentDonations: Array<{
    id: number;
    donorName: string;
    amount: number;
    date: string;
    paymentMode: string;
    purpose: string;
    status: string;
    isLifeMember: boolean;
  }>;
  recentMedicalDonations: Array<{
    id: number;
    donorName: string;
    itemName: string;
    category: string;
    quantity: number;
    strength: string | null;
    donationDate: string;
    status: string;
    isLifeMember: boolean;
  }>;
}

export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<{ data: DashboardStats }> => {
    const response = await api.get('/dashboard/stats');
    return { data: response.data.data };
  },
};