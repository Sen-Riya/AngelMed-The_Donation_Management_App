import api from './axios';


export interface Client {
  id: number;
  name: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  aadhaar: string;
  status: 'Active' | 'Inactive' | 'Dead';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Data required to create a client
export interface CreateClientData {
  name: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  aadhaar: string;
  status?: 'Active' | 'Inactive' | 'Dead';
  notes?: string;
}

export const clientsApi = {
  // Get all clients
  getAll: async (): Promise<{ clients: Client[] }> => {
    const response = await api.get('/clients');
    return { clients: response.data.clients };
  },

  // Get single client by id
  getOne: async (id: number): Promise<{ client: Client }> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Create client
  create: async (data: CreateClientData): Promise<{ message: string; clientId: number }> => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  // Update client
  update: async (id: number, data: Partial<CreateClientData>): Promise<{ message: string }> => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  // Deactivate client (soft delete)
  deactivate: async (id: number): Promise<{ message: string }> => {
    const response = await api.patch(`/clients/${id}/deactivate`);
    return response.data;
  },

  // Delete client (hard delete)
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};
