import api from './axios';


export type DistributionStatus = 'provided' | 'pending' | 'cancelled';

export type AssistanceType = 'money' | 'medicine' | 'equipment';

export interface Distribution {
  id: number;
  client_id: number;


  client_name?: string;
  client_phone?: string;
  client_address?: string;
  client_city?: string;
  client_state?: string;

  assistance_type: AssistanceType;
  
  // For money
  amount: number | null;
  
  // For medicine/equipment
  item_name: string | null;
  quantity: number | null;
  unit: string | null;
  
  // For medicine only
  strength: string | null;
  
  description: string | null;
  assistance_date: string;
  status: DistributionStatus;

  created_at: string;
  updated_at: string;
}

export interface CreateDistribution {
  client_id: number;
  assistance_type: AssistanceType;
  assistance_date: string;

  // For money
  amount?: number | null;
  
  // For medicine/equipment
  item_name?: string | null;
  quantity?: number | null;
  unit?: string | null;
  
  // For medicine only
  strength?: string | null;
  
  description?: string | null;

  status?: DistributionStatus;
}

export interface UpdateDistribution {
  assistance_type?: AssistanceType;
  amount?: number | null;
  item_name?: string | null;
  quantity?: number | null;
  unit?: string | null;
  strength?: string | null;
  description?: string | null;
  assistance_date?: string;
  status?: DistributionStatus;
}

export interface DistributionStats {
  total_distributions: number;
  provided_count: number;
  pending_count: number;
  cancelled_count: number;
  total_money_distributed: number;
  total_medicine_distributed: number;
  total_equipment_distributed: number;
}



export const distributionApi = {
  // Get all distributions
  getAll: async (): Promise<Distribution[]> => {
    const res = await api.get('/distributions');
    console.log('Raw API response:', res);
    console.log('res.data:', res.data);
    console.log('res.data.data:', res.data.data);
    // Handle multiple response formats
    const data = res.data.data || res.data || [];
    console.log('Returning data:', data);
    return Array.isArray(data) ? data : [];
  },

  // Get distribution by ID
  getById: async (id: number): Promise<Distribution> => {
    const res = await api.get(`/distributions/${id}`);
    return res.data.data || res.data;
  },

  // Get distributions by client
  getByClient: async (clientId: number): Promise<Distribution[]> => {
    const res = await api.get(`/distributions/client/${clientId}`);
    return res.data.data || res.data || [];
  },

  // Get distributions by status
  getByStatus: async (
    status: DistributionStatus
  ): Promise<Distribution[]> => {
    const res = await api.get(`/distributions/status/${status}`);
    return res.data.data || res.data || [];
  },

  // Get distributions by assistance type
  getByType: async (
    assistanceType: AssistanceType
  ): Promise<Distribution[]> => {
    const res = await api.get(`/distributions/type/${assistanceType}`);
    return res.data.data || res.data || [];
  },

  // Get distribution statistics
  getStats: async (): Promise<DistributionStats> => {
    const res = await api.get('/distributions/stats');
    return res.data.data || res.data;
  },

  // Create new distribution
  create: async (data: CreateDistribution): Promise<Distribution> => {
    const res = await api.post('/distributions', data);
    return res.data.data || res.data;
  },

  // Update full distribution record
  update: async (
    id: number,
    data: UpdateDistribution
  ): Promise<Distribution> => {
    const res = await api.put(`/distributions/${id}`, data);
    return res.data.data || res.data;
  },

  // Update only status
  updateStatus: async (
    id: number,
    status: DistributionStatus
  ): Promise<Distribution> => {
    const res = await api.patch(
      `/distributions/${id}/status`,
      { status }
    );
    return res.data.data || res.data;
  },

  // Delete distribution
  delete: async (id: number): Promise<void> => {
    await api.delete(`/distributions/${id}`);
  },
};