import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Validation helper functions
const validatePhone = (phone: string): boolean => {
  return /^\d{10}$/.test(phone);
};

const validateAadhar = (aadhar: string): boolean => {
  return /^\d{12}$/.test(aadhar);
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Get all life members (with donor info)
export const getAllMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const [members] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        lm.id,
        lm.donor_id,
        d.name,
        d.email,
        d.phone,
        d.address,
        d.status as donor_status,
        lm.aadhar_number,
        lm.join_date,
        lm.join_time,
        lm.membership_status,
        lm.created_at,
        lm.updated_at
      FROM life_members lm
      INNER JOIN donors d ON lm.donor_id = d.id
      WHERE d.donor_type = 'Life Member'
      ORDER BY lm.join_date DESC`
    );

    res.json({ 
      success: true,
      count: members.length,
      members 
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch members' 
    });
  }
};

// Get single member
export const getMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [members] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        lm.id,
        lm.donor_id,
        d.name,
        d.email,
        d.phone,
        d.address,
        d.status as donor_status,
        lm.aadhar_number,
        lm.join_date,
        lm.join_time,
        lm.membership_status,
        lm.created_at,
        lm.updated_at
      FROM life_members lm
      INNER JOIN donors d ON lm.donor_id = d.id
      WHERE lm.id = ?`,
      [id]
    );

    if (members.length === 0) {
      res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
      return;
    }

    res.json({ 
      success: true,
      member: members[0] 
    });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch member' 
    });
  }
};

// Create member (creates both donor and life_member records)
export const createMember = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { name, email, phone, address, aadhar_number, join_date, join_time } = req.body;

    console.log('Create member request:', req.body);

    // Validate required fields
    if (!name || !email || !join_date) {
      res.status(400).json({ 
        success: false,
        message: 'Name, email, and join date are required' 
      });
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
      return;
    }

    // Validate phone if provided
    if (phone && !validatePhone(phone)) {
      res.status(400).json({ 
        success: false,
        message: 'Phone number must be exactly 10 digits' 
      });
      return;
    }

    // Validate aadhar if provided
    if (aadhar_number && !validateAadhar(aadhar_number)) {
      res.status(400).json({ 
        success: false,
        message: 'Aadhar number must be exactly 12 digits' 
      });
      return;
    }

    // Start transaction
    await connection.beginTransaction();

    // Check if email already exists in donors
    const [existingDonors] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM donors WHERE email = ?',
      [email]
    );

    if (existingDonors.length > 0) {
      await connection.rollback();
      res.status(400).json({ 
        success: false,
        message: 'Member with this email already exists' 
      });
      return;
    }

    // Check if aadhar already exists (if provided)
    if (aadhar_number) {
      const [existingAadhar] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM life_members WHERE aadhar_number = ?',
        [aadhar_number]
      );

      if (existingAadhar.length > 0) {
        await connection.rollback();
        res.status(400).json({ 
          success: false,
          message: 'Member with this Aadhar number already exists' 
        });
        return;
      }
    }

    // 1. Insert into donors table
    const [donorResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO donors (name, email, phone, address, donor_type, status) 
       VALUES (?, ?, ?, ?, 'Life Member', 'Active')`,
      [name, email, phone || null, address || null]
    );

    const donorId = donorResult.insertId;

    // 2. Insert into life_members table
    const timeToInsert = join_time || new Date().toTimeString().slice(0, 8);

    const [memberResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO life_members (donor_id, aadhar_number, join_date, join_time, membership_status) 
       VALUES (?, ?, ?, ?, 'Active')`,
      [donorId, aadhar_number || null, join_date, timeToInsert]
    );

    // Commit transaction
    await connection.commit();

    console.log('Member created successfully - Donor ID:', donorId, 'Member ID:', memberResult.insertId);

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: {
        memberId: memberResult.insertId,
        donorId: donorId
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create member error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create member',
      error: String(error)
    });
  } finally {
    connection.release();
  }
};

// Update member (updates both donor and life_member records)
export const updateMember = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const updateFields = req.body;

    console.log('Update member request - ID:', id, 'Fields:', updateFields);

    // Get the member to find donor_id
    const [members] = await connection.execute<RowDataPacket[]>(
      'SELECT donor_id FROM life_members WHERE id = ?',
      [id]
    );

    if (members.length === 0) {
      res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
      return;
    }

    const donorId = members[0].donor_id;

    // Start transaction
    await connection.beginTransaction();

    // Update donors table
    const donorFields: string[] = [];
    const donorValues: any[] = [];

    if (updateFields.name !== undefined) {
      if (!updateFields.name.trim()) {
        await connection.rollback();
        res.status(400).json({ 
          success: false,
          message: 'Name cannot be empty' 
        });
        return;
      }
      donorFields.push('name = ?');
      donorValues.push(updateFields.name);
    }

    if (updateFields.email !== undefined) {
      if (!validateEmail(updateFields.email)) {
        await connection.rollback();
        res.status(400).json({ 
          success: false,
          message: 'Invalid email format' 
        });
        return;
      }

      // Check if email already exists (excluding current donor)
      const [existingDonors] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM donors WHERE email = ? AND id != ?',
        [updateFields.email, donorId]
      );

      if (existingDonors.length > 0) {
        await connection.rollback();
        res.status(400).json({ 
          success: false,
          message: 'Member with this email already exists' 
        });
        return;
      }

      donorFields.push('email = ?');
      donorValues.push(updateFields.email);
    }

    if (updateFields.phone !== undefined) {
      if (updateFields.phone && !validatePhone(updateFields.phone)) {
        await connection.rollback();
        res.status(400).json({ 
          success: false,
          message: 'Phone number must be exactly 10 digits' 
        });
        return;
      }
      donorFields.push('phone = ?');
      donorValues.push(updateFields.phone || null);
    }

    if (updateFields.address !== undefined) {
      donorFields.push('address = ?');
      donorValues.push(updateFields.address || null);
    }

    // Update life_members table
    const memberFields: string[] = [];
    const memberValues: any[] = [];

    if (updateFields.membership_status !== undefined) {
      if (!['Active', 'Inactive'].includes(updateFields.membership_status)) {
        await connection.rollback();
        res.status(400).json({ 
          success: false,
          message: 'Status must be Active or Inactive' 
        });
        return;
      }
      memberFields.push('membership_status = ?');
      memberValues.push(updateFields.membership_status);
    }

    // Execute updates
    if (donorFields.length > 0) {
      donorFields.push('updated_at = NOW()');
      donorValues.push(donorId);
      const donorQuery = `UPDATE donors SET ${donorFields.join(', ')} WHERE id = ?`;
      await connection.execute(donorQuery, donorValues);
    }

    if (memberFields.length > 0) {
      memberFields.push('updated_at = NOW()');
      memberValues.push(id);
      const memberQuery = `UPDATE life_members SET ${memberFields.join(', ')} WHERE id = ?`;
      await connection.execute(memberQuery, memberValues);
    }

    if (donorFields.length === 0 && memberFields.length === 0) {
      await connection.rollback();
      res.status(400).json({ 
        success: false,
        message: 'No fields to update' 
      });
      return;
    }

    // Commit transaction
    await connection.commit();

    console.log('Member updated successfully');
    res.json({ 
      success: true,
      message: 'Member updated successfully' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update member error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update member',
      error: String(error)
    });
  } finally {
    connection.release();
  }
};

// Deactivate member (change status to Inactive)
export const deactivateMember = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    console.log('Deactivating member ID:', id);

    // Get the member to find donor_id
    const [members] = await connection.execute<RowDataPacket[]>(
      'SELECT donor_id FROM life_members WHERE id = ?',
      [id]
    );

    if (members.length === 0) {
      res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
      return;
    }

    const donorId = members[0].donor_id;

    // Start transaction
    await connection.beginTransaction();

    // Update both tables
    await connection.execute(
      'UPDATE donors SET status = ?, updated_at = NOW() WHERE id = ?',
      ['Inactive', donorId]
    );

    await connection.execute(
      'UPDATE life_members SET membership_status = ?, updated_at = NOW() WHERE id = ?',
      ['Inactive', id]
    );

    await connection.commit();

    console.log('Member deactivated successfully');
    res.json({ 
      success: true,
      message: 'Member deactivated successfully' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Deactivate member error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to deactivate member' 
    });
  } finally {
    connection.release();
  }
};

// Delete member (permanent - cascades to life_members due to ON DELETE CASCADE)
export const deleteMember = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    // Get the member to find donor_id
    const [members] = await connection.execute<RowDataPacket[]>(
      'SELECT donor_id FROM life_members WHERE id = ?',
      [id]
    );

    if (members.length === 0) {
      res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
      return;
    }

    const donorId = members[0].donor_id;

    // Delete donor (this will cascade to life_members due to ON DELETE CASCADE)
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM donors WHERE id = ?',
      [donorId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ 
        success: false,
        message: 'Member not found' 
      });
      return;
    }

    res.json({ 
      success: true,
      message: 'Member deleted successfully' 
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete member' 
    });
  } finally {
    connection.release();
  }
};