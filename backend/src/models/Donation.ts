import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../config/database';

export interface Donation extends RowDataPacket {
  id: number;
  donor_id: number;
  donor_name?: string;
  donor_type?: string;
  donor_email?: string;
  donor_phone?: string;
  amount: number;
  date: string;
  payment_mode: string;
  purpose: string;
  status: 'Completed' | 'Pending';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDonationDTO {
  donor_id?: number;
  donor_name?: string;
  amount: number;
  date: string;
  payment_mode: string;
  purpose: string;
  status?: 'Completed' | 'Pending';
  notes?: string;
}

export interface UpdateDonationDTO {
  donor_id?: number;
  donor_name?: string;
  amount?: number;
  date?: string;
  payment_mode?: string;
  purpose?: string;
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

class DonationModel {
  // Helper: Find or create donor
  async findOrCreateDonor(donorName: string, donorType: string = 'Individual'): Promise<number> {
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
      'INSERT INTO donors (name, donor_type, status) VALUES (?, ?, ?)',
      [donorName, donorType, 'Active']
    );

    return result.insertId;
  }

  // Create new donation
  async create(donation: CreateDonationDTO): Promise<number> {
    let donorId: number;

    // Handle donor_id or donor_name
    if (donation.donor_id) {
      // Verify donor exists
      const [donors] = await db.query<RowDataPacket[]>(
        'SELECT id FROM donors WHERE id = ?',
        [donation.donor_id]
      );

      if (donors.length === 0) {
        throw new Error('Donor not found');
      }

      donorId = donation.donor_id;
    } else if (donation.donor_name) {
      donorId = await this.findOrCreateDonor(donation.donor_name);
    } else {
      throw new Error('Either donor_id or donor_name must be provided');
    }

    const query = `
      INSERT INTO donations (
        donor_id, amount, date, payment_mode, purpose, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query<ResultSetHeader>(query, [
      donorId,
      donation.amount,
      donation.date,
      donation.payment_mode,
      donation.purpose,
      donation.status || 'Completed',
      donation.notes || null
    ]);

    return result.insertId;
  }

  // Get all donations with filters
  async findAll(filters?: DonationFilters): Promise<Donation[]> {
    let query = `
      SELECT 
        d.id,
        d.donor_id,
        don.name as donor_name,
        don.donor_type,
        don.email as donor_email,
        don.phone as donor_phone,
        d.amount,
        d.date,
        d.payment_mode,
        d.purpose,
        d.status,
        d.notes,
        d.created_at,
        d.updated_at
      FROM donations d
      INNER JOIN donors don ON d.donor_id = don.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.status && filters.status !== 'All') {
      query += ' AND d.status = ?';
      params.push(filters.status);
    }

    if (filters?.search) {
      query += ' AND (don.name LIKE ? OR d.purpose LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters?.startDate) {
      query += ' AND d.date >= ?';
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ' AND d.date <= ?';
      params.push(filters.endDate);
    }

    if (filters?.donorType && filters.donorType !== 'All') {
      query += ' AND don.donor_type = ?';
      params.push(filters.donorType);
    }

    query += ' ORDER BY d.date DESC, d.created_at DESC';

    if (filters?.limit) {
      query += ' LIMIT ? OFFSET ?';
      params.push(filters.limit, filters.offset || 0);
    }

    const [rows] = await db.query<Donation[]>(query, params);
    return rows;
  }

  // Get donation by ID
  async findById(id: number): Promise<Donation | null> {
    const query = `
      SELECT 
        d.id,
        d.donor_id,
        don.name as donor_name,
        don.donor_type,
        don.email as donor_email,
        don.phone as donor_phone,
        d.amount,
        d.date,
        d.payment_mode,
        d.purpose,
        d.status,
        d.notes,
        d.created_at,
        d.updated_at
      FROM donations d
      INNER JOIN donors don ON d.donor_id = don.id
      WHERE d.id = ?
    `;
    const [rows] = await db.query<Donation[]>(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Update donation
  async update(id: number, donation: UpdateDonationDTO): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    // Handle donor update
    if (donation.donor_id !== undefined) {
      // Verify donor exists
      const [donors] = await db.query<RowDataPacket[]>(
        'SELECT id FROM donors WHERE id = ?',
        [donation.donor_id]
      );

      if (donors.length === 0) {
        throw new Error('Donor not found');
      }

      fields.push('donor_id = ?');
      values.push(donation.donor_id);
    } else if (donation.donor_name !== undefined) {
      const donorId = await this.findOrCreateDonor(donation.donor_name);
      fields.push('donor_id = ?');
      values.push(donorId);
    }

    // Add other fields
    if (donation.amount !== undefined) {
      fields.push('amount = ?');
      values.push(donation.amount);
    }
    if (donation.date !== undefined) {
      fields.push('date = ?');
      values.push(donation.date);
    }
    if (donation.payment_mode !== undefined) {
      fields.push('payment_mode = ?');
      values.push(donation.payment_mode);
    }
    if (donation.purpose !== undefined) {
      fields.push('purpose = ?');
      values.push(donation.purpose);
    }
    if (donation.status !== undefined) {
      fields.push('status = ?');
      values.push(donation.status);
    }
    if (donation.notes !== undefined) {
      fields.push('notes = ?');
      values.push(donation.notes);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE donations SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;

    const [result] = await db.query<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }

  // Delete donation
  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM donations WHERE id = ?`;
    const [result] = await db.query<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  // Get donations by donor ID
  async findByDonorId(donorId: number): Promise<Donation[]> {
    const query = `
      SELECT 
        d.id,
        d.donor_id,
        don.name as donor_name,
        don.donor_type,
        don.email as donor_email,
        don.phone as donor_phone,
        d.amount,
        d.date,
        d.payment_mode,
        d.purpose,
        d.status,
        d.notes,
        d.created_at,
        d.updated_at
      FROM donations d
      INNER JOIN donors don ON d.donor_id = don.id
      WHERE d.donor_id = ?
      ORDER BY d.date DESC, d.created_at DESC
    `;
    const [rows] = await db.query<Donation[]>(query, [donorId]);
    return rows;
  }

  // Get donations by life member ID
  async findByLifeMemberId(lifeMemberId: number): Promise<{ donorId: number; donations: Donation[] }> {
    // Get donor_id for this life member
    const [lifeMember] = await db.query<RowDataPacket[]>(
      'SELECT donor_id FROM life_members WHERE id = ?',
      [lifeMemberId]
    );

    if (lifeMember.length === 0) {
      throw new Error('Life member not found');
    }

    const donorId = lifeMember[0].donor_id;
    const donations = await this.findByDonorId(donorId);

    return { donorId, donations };
  }

  // Get donation statistics
  async getStats(month?: number, year?: number): Promise<{
    totalAmount: number;
    totalCount: number;
    completedCount: number;
    pendingCount: number;
    monthlyAmount: number;
  }> {
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN amount ELSE 0 END), 0) as total_amount,
        COUNT(*) as total_count,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
        (SELECT COALESCE(SUM(amount), 0) FROM donations 
         WHERE MONTH(date) = ? AND YEAR(date) = ? AND status = 'Completed') as monthly_amount
      FROM donations
    `;

    const [rows] = await db.query<RowDataPacket[]>(query, [currentMonth, currentYear]);
    const stats = rows[0];

    return {
      totalAmount: parseFloat(stats.total_amount) || 0,
      totalCount: parseInt(stats.total_count) || 0,
      completedCount: parseInt(stats.completed_count) || 0,
      pendingCount: parseInt(stats.pending_count) || 0,
      monthlyAmount: parseFloat(stats.monthly_amount) || 0
    };
  }
}

export default new DonationModel();
