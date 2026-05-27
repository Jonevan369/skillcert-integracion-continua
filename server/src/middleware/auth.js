import { db } from '../db/database.js';
import { publicUser } from '../db/sql.js';
import { verifyToken } from '../services/authService.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const payload = verifyToken(token);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });
    req.user = publicUser(user);
    return next();
  } catch {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
    req.user = publicUser(user);
  } catch {
    req.user = null;
  }
  return next();
}
