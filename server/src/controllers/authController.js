import { z } from 'zod';
import { db } from '../db/database.js';
import { publicUser } from '../db/sql.js';
import { hashPassword, signToken, verifyPassword } from '../services/authService.js';

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(120),
  headline: z.string().max(120).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function register(req, res, next) {
  try {
    const payload = registerSchema.parse(req.body);
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(payload.email);
    if (exists) return res.status(409).json({ message: 'El email ya esta registrado' });

    const passwordHash = await hashPassword(payload.password);
    const result = db
      .prepare('INSERT INTO users (name, email, password_hash, headline) VALUES (?, ?, ?, ?)')
      .run(payload.name, payload.email, passwordHash, payload.headline ?? 'Explorador de competencias');
    const user = publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid));
    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(payload.email);
    const ok = await verifyPassword(payload.password, row?.password_hash);
    if (!row || !ok) return res.status(401).json({ message: 'Credenciales invalidas' });

    const user = publicUser(row);
    return res.json({ token: signToken(user), user });
  } catch (error) {
    return next(error);
  }
}

export function me(req, res) {
  res.json(req.user);
}
