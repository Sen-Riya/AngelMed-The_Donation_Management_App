import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface Member extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone?: string;
  aadhar_number?: string;
  join_date: string;
  join_time?: string;
  status: 'Active' | 'Inactive';
  created_at: Date;
  updated_at: Date;
}

export interface CreateMemberDTO {
  name: string;
  email: string;
  phone?: string;
  aadhar_number?: string;
  join_date: string;
  join_time?: string;
  status?: 'Active' | 'Inactive';
}

export interface UpdateMemberDTO {
  name?: string;
  email?: string;
  phone?: string;
  aadhar_number?: string;
  join_date?: string;
  join_time?: string;
  status?: 'Active' | 'Inactive';
}

class MemberModel {
  async create(member: CreateMemberDTO): Promise<number> {
    const query = `
      INSERT INTO life_members 
      (name, email, phone, aadhar_number, join_date, join_time, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, [
      member.name,
      member.email,
      member.phone || null,
      member.aadhar_number || null,
      member.join_date,
      member.join_time || new Date().toTimeString().slice(0, 8),
      member.status || 'Active',
    ]);
    return result.insertId;
  }

  async findAll(filters?: { search?: string; status?: string; startDate?: string; endDate?: string }): Promise<Member[]> {
    let query = `SELECT * FROM life_members WHERE 1=1`;
    const params: any[] = [];

    if (filters?.search) {
      query += ` AND (name LIKE ? OR email LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters?.status && filters.status !== 'All') {
      query += ` AND status = ?`;
      params.push(filters.status);
    }
    if (filters?.startDate) {
      query += ` AND join_date >= ?`;
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ` AND join_date <= ?`;
      params.push(filters.endDate);
    }

    query += ` ORDER BY join_date DESC, created_at DESC`;

    const [rows] = await pool.execute<Member[]>(query, params);
    return rows;
  }

  async findById(id: number): Promise<Member | null> {
    const [rows] = await pool.execute<Member[]>(`SELECT * FROM life_members WHERE id = ?`, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async update(id: number, member: UpdateMemberDTO): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(member).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE life_members SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(`DELETE FROM life_members WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

export default new MemberModel();
