import { pool } from '../db.js';

export const logAudit = async (userId, action, entity, entityId, req) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address) VALUES (?, ?, ?, ?, ?)',
      [userId || null, action, entity, entityId || null, ip]
    );
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};