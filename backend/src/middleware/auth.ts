import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { getDb } from '../db/client';

interface JwtPayload {
  sub: number;
  email: string;
  iat: number;
  exp: number;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided', code: 'UNAUTHORIZED' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, config.jwt.secret) as unknown as JwtPayload;

    const db = getDb();
    const user = db
      .prepare(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?'
      )
      .get(payload.sub) as any;

    if (!user) {
      res.status(401).json({ error: 'User not found', code: 'UNAUTHORIZED' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    } else {
      res.status(401).json({ error: 'Invalid token', code: 'UNAUTHORIZED' });
    }
  }
}
