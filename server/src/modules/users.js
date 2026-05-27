import { z } from 'zod';
import { db } from '../db/database.js';

const userSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email()
});

export async function listUsers(req, res, next) {
  try {
    const users = db.prepare('SELECT id, name, email, created_at AS createdAt FROM users ORDER BY id ASC').all();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const payload = userSchema.parse(req.body);
    const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(payload.name, payload.email);
    const user = db
      .prepare('SELECT id, name, email, created_at AS createdAt FROM users WHERE id = ?')
      .get(result.lastInsertRowid);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}
