import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDb } from '../db/client';
import { config } from '../config';
import type { UserDTO, AuthResponse } from '../types/shared';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateAccessToken(user: UserDTO): string {
  return jwt.sign(
    { sub: user.id, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiresIn } as any
  );
}

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

function getRefreshExpiresAt(): string {
  const days = config.jwt.refreshExpiresIn.includes('d')
    ? parseInt(config.jwt.refreshExpiresIn)
    : 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function register(email: string, password: string, name: string): AuthResponse {
  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    throw Object.assign(new Error('Email already registered'), { statusCode: 409, code: 'EMAIL_EXISTS' });
  }

  const hash = bcrypt.hashSync(password, 12);
  const result = db
    .prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)')
    .run(email, hash, name);

  const userId = result.lastInsertRowid as number;

  const user = db
    .prepare('SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?')
    .get(userId) as UserDTO;

  const accessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);

  db.prepare(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
  ).run(userId, tokenHash, getRefreshExpiresAt());

  return { user, accessToken, refreshToken: rawRefreshToken };
}

export function login(email: string, password: string): AuthResponse {
  const db = getDb();

  const row = db
    .prepare('SELECT id, email, password, name, created_at, updated_at FROM users WHERE email = ?')
    .get(email) as any;

  if (!row || !bcrypt.compareSync(password, row.password)) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
  }

  const user: UserDTO = {
    id: row.id,
    email: row.email,
    name: row.name,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  const accessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);

  db.prepare(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
  ).run(row.id, tokenHash, getRefreshExpiresAt());

  return { user, accessToken, refreshToken: rawRefreshToken };
}

export function refreshTokens(rawRefreshToken: string): AuthResponse {
  const db = getDb();
  const tokenHash = hashToken(rawRefreshToken);

  const stored = db
    .prepare(
      `SELECT rt.id, rt.user_id, rt.expires_at,
              u.id as uid, u.email, u.name, u.created_at, u.updated_at
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token = ?`
    )
    .get(tokenHash) as any;

  if (!stored) {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401, code: 'INVALID_REFRESH_TOKEN' });
  }

  if (new Date(stored.expires_at) < new Date()) {
    db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(stored.id);
    throw Object.assign(new Error('Refresh token expired'), { statusCode: 401, code: 'TOKEN_EXPIRED' });
  }

  // Rotate refresh token
  db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(stored.id);

  const user: UserDTO = {
    id: stored.uid,
    email: stored.email,
    name: stored.name,
    created_at: stored.created_at,
    updated_at: stored.updated_at,
  };

  const accessToken = generateAccessToken(user);
  const newRawRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRawRefreshToken);

  db.prepare(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
  ).run(user.id, newTokenHash, getRefreshExpiresAt());

  return { user, accessToken, refreshToken: newRawRefreshToken };
}

export function logout(rawRefreshToken: string): void {
  const db = getDb();
  const tokenHash = hashToken(rawRefreshToken);
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(tokenHash);
}
