import { db } from './database.js';

export function tableColumns(tableName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name);
}

export function addColumnIfMissing(tableName, columnName, definition) {
  if (!tableColumns(tableName).includes(columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

export function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    headline: row.headline ?? '',
    bio: row.bio ?? '',
    karma: Number(row.karma ?? 0),
    createdAt: row.created_at ?? row.createdAt
  };
}
