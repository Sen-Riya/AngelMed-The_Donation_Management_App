import api from './axios';

export interface Member {
  id: number;
  donor_id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  donor_status: 'Active' | 'Inactive';
  aadhar_number?: string;
  join_date: string;
  join_time?: string;
  membership_status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

export interface CreateMemberData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  aadhar_number?: string;
  join_date: string;
  join_time?: string;
}

export interface UpdateMemberData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  membership_status?: 'Active' | 'Inactive';
}

export const membersApi = {
  // Get all members
  getAll: async (): Promise<{ success: boolean; count: number; members: Member[] }> => {
    const response = await api.get('/members');
    return response.data;
  },

  // Get single member
  getOne: async (id: number): Promise<{ success: boolean; member: Member }> => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },

  // Create member
  create: async (data: CreateMemberData): Promise<{ 
    success: boolean; 
    message: string; 
    data: { memberId: number; donorId: number } 
  }> => {
    const response = await api.post('/members', data);
    return response.data;
  },

  // Update member
  update: async (id: number, data: UpdateMemberData): Promise<{ 
    success: boolean; 
    message: string 
  }> => {
    const response = await api.put(`/members/${id}`, data);
    return response.data;
  },

  // Deactivate member (soft delete)
  deactivate: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch(`/members/${id}/deactivate`);
    return response.data;
  },

  // Delete member (hard delete)
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  },
};