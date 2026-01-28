import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface Client extends RowDataPacket {
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
  created_at: Date;
  updated_at: Date;
}

export interface CreateClientDTO {
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

export interface UpdateClientDTO {
  name?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  aadhaar?: string;
  status?: 'Active' | 'Inactive' | 'Dead';
  notes?: string;
}

class ClientModel {
  async create(client: CreateClientDTO): Promise<number> {
    const query = `
      INSERT INTO clients
      (name, age, gender, phone, address, city, state, zip, aadhaar, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, [
      client.name,
      client.age || null,
      client.gender || null,
      client.phone || null,
      client.address,
      client.city,
      client.state,
      client.zip,
      client.aadhaar,
      client.status || 'Active',
      client.notes || null
    ]);
    return result.insertId;
  }

  async findAll(filters?: { search?: string; status?: string }): Promise<Client[]> {
    let query = `SELECT * FROM clients WHERE 1=1`;
    const params: any[] = [];

    if (filters?.search) {
      query += ` AND (name LIKE ? OR city LIKE ? OR address LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters?.status && filters.status !== 'All') {
      query += ` AND status = ?`;
      params.push(filters.status);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.execute<Client[]>(query, params);
    return rows;
  }

  async findById(id: number): Promise<Client | null> {
    const [rows] = await pool.execute<Client[]>(`SELECT * FROM clients WHERE id = ?`, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async update(id: number, client: UpdateClientDTO): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(client).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE clients SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(`DELETE FROM clients WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

export default new ClientModel();
