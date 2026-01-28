import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  email: string;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ message: 'Access token required' });
      return;
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err, decoded) => {
        if (err) {
          res.status(403).json({ message: 'Invalid or expired token' });
          return;
        }

        req.user = decoded as JwtPayload;
        next();
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Authentication error' });
  }
};