import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import pool from '../config/database';
import type { RowDataPacket } from 'mysql2';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: (result as any).insertId
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
};