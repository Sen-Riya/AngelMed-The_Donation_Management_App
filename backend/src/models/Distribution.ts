import db from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Distribution extends RowDataPacket {
  id: number;
  client_id: number;
  assistance_type: 'money' | 'medicine' | 'equipment';
  amount?: number;
  quantity?: number;
  unit?: string;
  description?: string;
  assistance_date: string;
  status: 'provided' | 'pending' | 'cancelled';
  created_at: string;
  updated_at: string;
  // From JOIN with clients
  client_name?: string;
  client_phone?: string;
  client_address?: string;
  client_city?: string;
  client_state?: string;
}

export interface CreateDistributionData {
  client_id: number;
  assistance_type: 'money' | 'medicine' | 'equipment';
  amount?: number;
  quantity?: number;
  unit?: string;
  description?: string;
  assistance_date: string;
  status?: 'provided' | 'pending' | 'cancelled';
}

export interface UpdateDistributionData {
  client_id?: number;
  assistance_type?: 'money' | 'medicine' | 'equipment';
  amount?: number;
  quantity?: number;
  unit?: string;
  description?: string;
  assistance_date?: string;
  status?: 'provided' | 'pending' | 'cancelled';
}

export interface DistributionFilters {
  client_id?: number;
  assistance_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

// Get all distributions with optional filters
export const getAllDistributions = async (filters: DistributionFilters = {}): Promise<Distribution[]> => {
  try {
    let query = `
      SELECT 
        d.*,
        c.name as client_name,
        c.phone as client_phone,
        c.address as client_address,
        c.city as client_city,
        c.state as client_state
      FROM distributions d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.client_id) {
      query += ' AND d.client_id = ?';
      params.push(filters.client_id);
    }

    if (filters.assistance_type) {
      query += ' AND d.assistance_type = ?';
      params.push(filters.assistance_type);
    }

    if (filters.status) {
      query += ' AND d.status = ?';
      params.push(filters.status);
    }

    if (filters.start_date) {
      query += ' AND d.assistance_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND d.assistance_date <= ?';
      params.push(filters.end_date);
    }

    if (filters.search) {
      query += ' AND (c.name LIKE ? OR c.phone LIKE ? OR d.description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY d.assistance_date DESC, d.created_at DESC';

    const [rows] = await db.query<Distribution[]>(query, params);
    return rows;
  } catch (error) {
    console.error('Error in getAllDistributions:', error);
    throw error;
  }
};

// Get distribution by ID
export const getDistributionById = async (id: number): Promise<Distribution | null> => {
  try {
    const [rows] = await db.query<Distribution[]>(
      `SELECT 
        d.*,
        c.name as client_name,
        c.phone as client_phone,
        c.address as client_address,
        c.city as client_city,
        c.state as client_state
      FROM distributions d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error in getDistributionById:', error);
    throw error;
  }
};

// Get distributions by client ID
export const getDistributionsByClientId = async (clientId: number): Promise<Distribution[]> => {
  try {
    const [rows] = await db.query<Distribution[]>(
      `SELECT 
        d.*,
        c.name as client_name,
        c.phone as client_phone,
        c.address as client_address,
        c.city as client_city,
        c.state as client_state
      FROM distributions d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.client_id = ?
      ORDER BY d.assistance_date DESC`,
      [clientId]
    );
    return rows;
  } catch (error) {
    console.error('Error in getDistributionsByClientId:', error);
    throw error;
  }
};

// Create new distribution
export const createDistribution = async (data: CreateDistributionData): Promise<number> => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO distributions (
        client_id, 
        assistance_type, 
        amount, 
        quantity, 
        unit, 
        description, 
        assistance_date, 
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.client_id,
        data.assistance_type,
        data.amount || null,
        data.quantity || null,
        data.unit || null,
        data.description || null,
        data.assistance_date,
        data.status || 'pending'
      ]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error in createDistribution:', error);
    throw error;
  }
};

// Update distribution
export const updateDistribution = async (id: number, data: UpdateDistributionData): Promise<boolean> => {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.client_id !== undefined) {
      fields.push('client_id = ?');
      values.push(data.client_id);
    }
    if (data.assistance_type !== undefined) {
      fields.push('assistance_type = ?');
      values.push(data.assistance_type);
    }
    if (data.amount !== undefined) {
      fields.push('amount = ?');
      values.push(data.amount);
    }
    if (data.quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(data.quantity);
    }
    if (data.unit !== undefined) {
      fields.push('unit = ?');
      values.push(data.unit);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.assistance_date !== undefined) {
      fields.push('assistance_date = ?');
      values.push(data.assistance_date);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE distributions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in updateDistribution:', error);
    throw error;
  }
};

// Delete distribution
export const deleteDistribution = async (id: number): Promise<boolean> => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      'DELETE FROM distributions WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in deleteDistribution:', error);
    throw error;
  }
};

// Update distribution status
export const updateDistributionStatus = async (
  id: number, 
  status: 'provided' | 'pending' | 'cancelled'
): Promise<boolean> => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      'UPDATE distributions SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in updateDistributionStatus:', error);
    throw error;
  }
};

// Get distribution statistics
export const getDistributionStats = async () => {
  try {
    const [stats] = await db.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_distributions,
        SUM(CASE WHEN status = 'provided' THEN 1 ELSE 0 END) as provided_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
        COALESCE(SUM(CASE WHEN assistance_type = 'money' AND status = 'provided' THEN amount ELSE 0 END), 0) as total_money_distributed,
        SUM(CASE WHEN assistance_type = 'medicine' AND status = 'provided' THEN quantity ELSE 0 END) as total_medicine_distributed,
        SUM(CASE WHEN assistance_type = 'equipment' AND status = 'provided' THEN quantity ELSE 0 END) as total_equipment_distributed
      FROM distributions`
    );
    return stats[0] || null;
  } catch (error) {
    console.error('Error in getDistributionStats:', error);
    throw error;
  }
};