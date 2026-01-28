import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

// Validation helper functions
const validatePhone = (phone: string): boolean => /^\d{10}$/.test(phone);
const validateAadhaar = (aadhaar: string): boolean => /^\d{12}$/.test(aadhaar);

// Get all clients
export const getAllClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const [clients] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM clients ORDER BY created_at DESC'
    );
    res.json({ clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Failed to fetch clients' });
  }
};

// Get single client
export const getClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [clients] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );

    if (clients.length === 0) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    res.json({ client: clients[0] });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ message: 'Failed to fetch client' });
  }
};

// Create client
export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, age, gender, phone, address, city, state, zip, aadhaar, status, notes
    } = req.body;

    console.log('Create client request:', req.body);

    // Validate required fields
    if (!name || !address || !city || !state || !zip || !aadhaar) {
      res.status(400).json({ message: 'Name, address, city, state, zip, and Aadhaar are required' });
      return;
    }

    // Validate phone if provided
    if (phone && !validatePhone(phone)) {
      res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
      return;
    }

    // Validate Aadhaar
    if (!validateAadhaar(aadhaar)) {
      res.status(400).json({ message: 'Aadhaar must be exactly 12 digits' });
      return;
    }

    // Check for duplicate Aadhaar
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM clients WHERE aadhaar = ?',
      [aadhaar]
    );

    if (existing.length > 0) {
      res.status(400).json({ message: 'Client with this Aadhaar already exists' });
      return;
    }

    const [result] = await pool.execute(
      'INSERT INTO clients (name, age, gender, phone, address, city, state, zip, aadhaar, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        age || null,
        gender || null,
        phone || null,
        address,
        city,
        state,
        zip,
        aadhaar,
        status || 'Active',
        notes || null
      ]
    );

    console.log('Client created successfully with ID:', (result as any).insertId);

    res.status(201).json({
      message: 'Client created successfully',
      clientId: (result as any).insertId
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Failed to create client', error: String(error) });
  }
};

// Update client
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    console.log('Update client request - ID:', id, 'Fields:', updateFields);

    const fields: string[] = [];
    const values: any[] = [];

    // Validate and add fields dynamically
    if (updateFields.name !== undefined) {
      if (!updateFields.name.trim()) {
        res.status(400).json({ message: 'Name cannot be empty' });
        return;
      }
      fields.push('name = ?');
      values.push(updateFields.name);
    }

    if (updateFields.age !== undefined) {
      fields.push('age = ?');
      values.push(updateFields.age || null);
    }

    if (updateFields.gender !== undefined) {
      fields.push('gender = ?');
      values.push(updateFields.gender || null);
    }

    if (updateFields.phone !== undefined) {
      if (updateFields.phone && !validatePhone(updateFields.phone)) {
        res.status(400).json({ message: 'Phone must be exactly 10 digits' });
        return;
      }
      fields.push('phone = ?');
      values.push(updateFields.phone || null);
    }

    if (updateFields.address !== undefined) {
      fields.push('address = ?');
      values.push(updateFields.address);
    }

    if (updateFields.city !== undefined) {
      fields.push('city = ?');
      values.push(updateFields.city);
    }

    if (updateFields.state !== undefined) {
      fields.push('state = ?');
      values.push(updateFields.state);
    }

    if (updateFields.zip !== undefined) {
      fields.push('zip = ?');
      values.push(updateFields.zip);
    }

    if (updateFields.aadhaar !== undefined) {
      if (!validateAadhaar(updateFields.aadhaar)) {
        res.status(400).json({ message: 'Aadhaar must be exactly 12 digits' });
        return;
      }

      // Check if new Aadhaar already exists
      const [existing] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM clients WHERE aadhaar = ? AND id != ?',
        [updateFields.aadhaar, id]
      );

      if (existing.length > 0) {
        res.status(400).json({ message: 'Client with this Aadhaar already exists' });
        return;
      }

      fields.push('aadhaar = ?');
      values.push(updateFields.aadhaar);
    }

    if (updateFields.status !== undefined) {
      if (!['Active', 'Inactive', 'Dead'].includes(updateFields.status)) {
        res.status(400).json({ message: 'Status must be Active, Inactive, or Dead' });
        return;
      }
      fields.push('status = ?');
      values.push(updateFields.status);
    }

    if (updateFields.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updateFields.notes || null);
    }

    if (fields.length === 0) {
      res.status(400).json({ message: 'No fields to update' });
      return;
    }

    // Add updated_at timestamp
    fields.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE clients SET ${fields.join(', ')} WHERE id = ?`;
    console.log('Executing query:', query, 'Values:', values);

    const [result] = await pool.execute(query, values);

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    console.log('Client updated successfully');
    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Failed to update client', error: String(error) });
  }
};

// Deactivate client
export const deactivateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE clients SET status = ?, updated_at = NOW() WHERE id = ?',
      ['Inactive', id]
    );

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    res.json({ message: 'Client deactivated successfully' });
  } catch (error) {
    console.error('Deactivate client error:', error);
    res.status(500).json({ message: 'Failed to deactivate client' });
  }
};

// Delete client
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM clients WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Failed to delete client' });
  }
};
