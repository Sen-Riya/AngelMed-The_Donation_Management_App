import db from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface MedicalDonation extends RowDataPacket {
  id: number;
  donor_id: number;
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  item_name: string;
  category: string;
  strength: string | null;
  quantity: number;
  expiry_date: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'collected';
  donation_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMedicalDonation {
  donor_id?: number;
  donor_name?: string; // Frontend sends this
  item_name: string;
  category: string;
  strength?: string;
  quantity: number;
  expiry_date?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'collected';
}

// Helper: Find or create donor
const findOrCreateDonor = async (donorName: string): Promise<number> => {
  // Check if donor exists (case-insensitive)
  const [existingDonors] = await db.query<RowDataPacket[]>(
    'SELECT id FROM donors WHERE LOWER(name) = LOWER(?)',
    [donorName]
  );

  if (existingDonors.length > 0) {
    return existingDonors[0].id;
  }

  // Create new donor
  const [result] = await db.query<ResultSetHeader>(
    'INSERT INTO donors (name, status) VALUES (?, ?)',
    [donorName, 'Active']
  );

  return result.insertId;
};

// Get all medical donations with donor details from unified donors table
export const getAllMedicalDonations = async (): Promise<MedicalDonation[]> => {
  const [rows] = await db.query<MedicalDonation[]>(
    `SELECT 
      md.*,
      d.name as donor_name,
      d.email as donor_email,
      d.phone as donor_phone
    FROM medical_donations md
    LEFT JOIN donors d ON md.donor_id = d.id
    ORDER BY md.donation_date DESC, md.created_at DESC`
  );
  return rows;
};

// Get medical donation by ID
export const getMedicalDonationById = async (id: number): Promise<MedicalDonation | null> => {
  const [rows] = await db.query<MedicalDonation[]>(
    `SELECT 
      md.*,
      d.name as donor_name,
      d.email as donor_email,
      d.phone as donor_phone
    FROM medical_donations md
    LEFT JOIN donors d ON md.donor_id = d.id
    WHERE md.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Get donations by donor
export const getMedicalDonationsByDonor = async (donorId: number): Promise<MedicalDonation[]> => {
  const [rows] = await db.query<MedicalDonation[]>(
    `SELECT 
      md.*,
      d.name as donor_name,
      d.email as donor_email,
      d.phone as donor_phone
    FROM medical_donations md
    LEFT JOIN donors d ON md.donor_id = d.id
    WHERE md.donor_id = ?
    ORDER BY md.donation_date DESC, md.created_at DESC`,
    [donorId]
  );
  return rows;
};

// Get donations by status
export const getMedicalDonationsByStatus = async (status: string): Promise<MedicalDonation[]> => {
  const [rows] = await db.query<MedicalDonation[]>(
    `SELECT 
      md.*,
      d.name as donor_name,
      d.email as donor_email,
      d.phone as donor_phone
    FROM medical_donations md
    LEFT JOIN donors d ON md.donor_id = d.id
    WHERE md.status = ?
    ORDER BY md.donation_date DESC, md.created_at DESC`,
    [status]
  );
  return rows;
};

// Get expiring donations (within specified days)
export const getExpiringDonations = async (days: number = 30): Promise<MedicalDonation[]> => {
  const [rows] = await db.query<MedicalDonation[]>(
    `SELECT 
      md.*,
      d.name as donor_name,
      d.email as donor_email,
      d.phone as donor_phone
    FROM medical_donations md
    LEFT JOIN donors d ON md.donor_id = d.id
    WHERE md.expiry_date IS NOT NULL
      AND md.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      AND md.status IN ('pending', 'approved')
    ORDER BY md.expiry_date ASC`,
    [days]
  );
  return rows;
};

// Get expired donations
export const getExpiredDonations = async (): Promise<MedicalDonation[]> => {
  const [rows] = await db.query<MedicalDonation[]>(
    `SELECT 
      md.*,
      d.name as donor_name,
      d.email as donor_email,
      d.phone as donor_phone
    FROM medical_donations md
    LEFT JOIN donors d ON md.donor_id = d.id
    WHERE md.expiry_date IS NOT NULL
      AND md.expiry_date < CURDATE()
      AND md.status IN ('pending', 'approved')
    ORDER BY md.expiry_date DESC`
  );
  return rows;
};

// Create new medical donation - UPDATED to handle donor_name
export const createMedicalDonation = async (data: CreateMedicalDonation): Promise<number> => {
  let donorId = data.donor_id;

  // If donor_name is provided instead of donor_id, find or create donor
  if (data.donor_name && !donorId) {
    donorId = await findOrCreateDonor(data.donor_name);
  }

  if (!donorId) {
    throw new Error('Either donor_id or donor_name must be provided');
  }

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO medical_donations 
      (donor_id, item_name, category, strength, quantity, expiry_date, status, donation_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
    [
      donorId,
      data.item_name,
      data.category,
      data.strength || null,
      data.quantity,
      data.expiry_date || null,
      data.status || 'pending'
    ]
  );
  return result.insertId;
};

// Update medical donation
export const updateMedicalDonation = async (id: number, data: Partial<CreateMedicalDonation>): Promise<boolean> => {
  const fields: string[] = [];
  const values: any[] = [];

  // Handle donor_name if provided
  if (data.donor_name !== undefined) {
    const donorId = await findOrCreateDonor(data.donor_name);
    fields.push('donor_id = ?');
    values.push(donorId);
  } else if (data.donor_id !== undefined) {
    fields.push('donor_id = ?');
    values.push(data.donor_id);
  }

  if (data.item_name !== undefined) {
    fields.push('item_name = ?');
    values.push(data.item_name);
  }
  if (data.category !== undefined) {
    fields.push('category = ?');
    values.push(data.category);
  }
  if (data.strength !== undefined) {
    fields.push('strength = ?');
    values.push(data.strength || null);
  }
  if (data.quantity !== undefined) {
    fields.push('quantity = ?');
    values.push(data.quantity);
  }
  if (data.expiry_date !== undefined) {
    fields.push('expiry_date = ?');
    values.push(data.expiry_date || null);
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    values.push(data.status);
  }

  if (fields.length === 0) return false;

  values.push(id);
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE medical_donations SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
};

// Update donation status only
export const updateMedicalDonationStatus = async (id: number, status: string): Promise<boolean> => {
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE medical_donations SET status = ?, updated_at = NOW() WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows > 0;
};

// Delete medical donation
export const deleteMedicalDonation = async (id: number): Promise<boolean> => {
  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM medical_donations WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

// Get statistics
export const getMedicalDonationStats = async () => {
  const [stats] = await db.query<RowDataPacket[]>(
    `SELECT 
      COUNT(*) as total_donations,
      SUM(quantity) as total_quantity,
      COUNT(DISTINCT donor_id) as unique_donors,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
      SUM(CASE WHEN status = 'collected' THEN 1 ELSE 0 END) as collected_count,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
      SUM(CASE WHEN expiry_date < CURDATE() THEN 1 ELSE 0 END) as expired_count,
      SUM(CASE WHEN expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiring_soon_count
    FROM medical_donations`
  );
  return stats[0];
};