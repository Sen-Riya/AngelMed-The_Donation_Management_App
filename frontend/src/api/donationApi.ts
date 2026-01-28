import api from './axios';

export interface Donation {
  id: number;
  donor_id: number;
  donor_name: string;
  donor_type: string;
  donor_email?: string;
  donor_phone?: string;
  amount: number;
  date: string;
  payment_mode: string;
  purpose: string;
  status: 'Completed' | 'Pending';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDonationData {
  donor_id?: number;
  donor_name?: string;
  amount: number;
  date: string;
  payment_mode: string;
  purpose: string;
  status?: 'Completed' | 'Pending';
  notes?: string;
}

export interface DonationFilters {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  donorType?: string;
  limit?: number;
  offset?: number;
}

export interface DonationStats {
  totalAmount: number;
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  monthlyAmount: number;
}

export const donationsApi = {
  // Get all donations with optional filters
  getAll: async (filters?: DonationFilters): Promise<{ 
    success: boolean; 
    count: number; 
    data: Donation[] 
  }> => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.donorType) params.append('donorType', filters.donorType);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
    }

    const response = await api.get(`/donations?${params.toString()}`);
    return response.data;
  },

  // Get single donation
  getOne: async (id: number): Promise<{ 
    success: boolean; 
    data: Donation 
  }> => {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  },

  // Create donation
  create: async (data: CreateDonationData): Promise<{ 
    success: boolean; 
    message: string; 
    data: Donation 
  }> => {
    const response = await api.post('/donations', data);
    return response.data;
  },

  // Update donation
  update: async (id: number, data: Partial<CreateDonationData>): Promise<{ 
    success: boolean; 
    message: string; 
    data: Donation 
  }> => {
    const response = await api.put(`/donations/${id}`, data);
    return response.data;
  },

  // Delete donation
  delete: async (id: number): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.delete(`/donations/${id}`);
    return response.data;
  },

  // Get donations by donor
  getByDonor: async (donorId: number): Promise<{ 
    success: boolean; 
    count: number; 
    data: Donation[] 
  }> => {
    const response = await api.get(`/donations/donor/${donorId}`);
    return response.data;
  },

  // Get donations by life member
  getByLifeMember: async (lifeMemberId: number): Promise<{ 
    success: boolean; 
    count: number; 
    lifeMemberId: number;
    donorId: number;
    data: Donation[] 
  }> => {
    const response = await api.get(`/donations/life-member/${lifeMemberId}`);
    return response.data;
  },

  // Get donation statistics
  getStats: async (month?: number, year?: number): Promise<{ 
    success: boolean; 
    data: DonationStats 
  }> => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());

    const response = await api.get(`/donations/stats?${params.toString()}`);
    return response.data;
  },
};