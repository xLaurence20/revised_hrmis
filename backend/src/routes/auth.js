import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const isProd = process.env.NODE_ENV === 'production';
const cookieOpts = { httpOnly: true, secure: true, sameSite: 'none' };

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.email, u.password_hash, r.slug as role,
       GROUP_CONCAT(p.slug) as permissions
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN role_permissions rp ON r.id = rp.role_id
       LEFT JOIN permissions p ON rp.permission_id = p.id
       WHERE u.email = ? OR u.username = ? GROUP BY u.id`,
      [identifier, identifier]
    );

    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const perms = user.permissions ? user.permissions.split(',') : [];
    const payload = { id: user.id, role: user.role, permissions: perms };
    
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('accessToken', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const { id } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Re-fetch user and permissions to generate a fresh access token
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.email, r.slug as role,
       GROUP_CONCAT(p.slug) as permissions
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN role_permissions rp ON r.id = rp.role_id
       LEFT JOIN permissions p ON rp.permission_id = p.id
       WHERE u.id = ? GROUP BY u.id`,
      [id]
    );

    const user = users[0];
    if (!user) return res.status(401).json({ error: 'User not found' });

    const perms = user.permissions ? user.permissions.split(',') : [];
    const payload = { id: user.id, role: user.role, permissions: perms };
    
    // Generate new Access Token
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

    // Set the new cookie
    res.cookie('accessToken', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
    
    res.status(200).json({ message: 'Refreshed' });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken', cookieOpts);
  res.clearCookie('refreshToken', cookieOpts);
  res.json({ message: 'Logged out' });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;