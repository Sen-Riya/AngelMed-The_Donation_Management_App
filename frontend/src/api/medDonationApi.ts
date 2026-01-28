import api from './axios';

/* =======================
   Types
======================= */

export type MedicalDonationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'collected';

export type MedicalDonationCategory =
  | 'Medicine'
  | 'Supplement'
  | 'Equipment';

export interface MedicalDonation {
  id: number;
  donor_id: number;

  // Joined donor details (optional – backend dependent)
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;

  item_name: string;
  category: MedicalDonationCategory;
  strength: string | null;
  quantity: number;
  expiry_date: string | null;
  status: MedicalDonationStatus;

  donation_time: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMedicalDonation {
  donor_id: number;
  item_name: string;
  category: MedicalDonationCategory;
  quantity: number;

  strength?: string | null;
  expiry_date?: string | null;

  // optional → DB defaults to 'pending'
  status?: MedicalDonationStatus;
}

export interface UpdateMedicalDonation {
  item_name?: string;
  category?: MedicalDonationCategory;
  strength?: string | null;
  quantity?: number;
  expiry_date?: string | null;
  status?: MedicalDonationStatus;
}

/* =======================
   API Methods
======================= */

export const medDonationApi = {
  // Get all medical donations
  getAll: async (): Promise<MedicalDonation[]> => {
    const res = await api.get('/medical-donations');
    return res.data.data;
  },

  // Get medical donation by ID
  getById: async (id: number): Promise<MedicalDonation> => {
    const res = await api.get(`/medical-donations/${id}`);
    return res.data.data;
  },

  // Get donations by donor
  getByDonor: async (donorId: number): Promise<MedicalDonation[]> => {
    const res = await api.get(`/medical-donations/donor/${donorId}`);
    return res.data.data;
  },

  // Get donations by status
  getByStatus: async (
    status: MedicalDonationStatus
  ): Promise<MedicalDonation[]> => {
    const res = await api.get(`/medical-donations/status/${status}`);
    return res.data.data;
  },

  // Get expiring donations
  getExpiring: async (days = 30): Promise<MedicalDonation[]> => {
    const res = await api.get(
      `/medical-donations/expiring?days=${days}`
    );
    return res.data.data;
  },

  // Create new medical donation
  create: async (
    data: CreateMedicalDonation
  ): Promise<MedicalDonation> => {
    const res = await api.post('/medical-donations', data);
    return res.data.data;
  },

  // Update full donation record
  update: async (
    id: number,
    data: UpdateMedicalDonation
  ): Promise<MedicalDonation> => {
    const res = await api.put(`/medical-donations/${id}`, data);
    return res.data.data;
  },

  // Update only status
  updateStatus: async (
    id: number,
    status: MedicalDonationStatus
  ): Promise<MedicalDonation> => {
    const res = await api.patch(
      `/medical-donations/${id}/status`,
      { status }
    );
    return res.data.data;
  },

  // Delete donation
  delete: async (id: number): Promise<void> => {
    await api.delete(`/medical-donations/${id}`);
  },
};
