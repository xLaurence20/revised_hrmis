import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const isProd = process.env.NODE_ENV === 'production';

// Cookie options for secure sessions
const cookieOpts = { 
  httpOnly: true, 
  secure: isProd, 
  sameSite: isProd ? 'none' : 'lax' 
};

router.post('/google', async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Verify the Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const googleSub = payload['sub']; // Permanent Google User ID
    const email = payload['email'];
    const name = payload['name'];
    const picture = payload['picture'];

    // 2. Check if user already exists in our database
    const [existingUsers] = await pool.query(
      'SELECT id, role_id FROM users WHERE google_sub = ?', 
      [googleSub]
    );

    let userId, userRole;

    if (existingUsers.length > 0) {
      // User exists, update last login and picture
      userId = existingUsers[0].id;
      
      // Get role slug for the JWT payload
      const [roleData] = await pool.query('SELECT slug FROM roles WHERE id = ?', [existingUsers[0].role_id]);
      userRole = roleData[0].slug;

      await pool.query(
        'UPDATE users SET picture_url = ?, last_login_at = NOW() WHERE id = ?',
        [picture, userId]
      );
    } else {
      // New user! Create an account with default 'employee' role
      const [roles] = await pool.query("SELECT id FROM roles WHERE slug = 'employee'");
      const employeeRoleId = roles[0].id;

      // Generate a dummy password hash so the NOT NULL constraint doesn't fail
      const dummyHash = await bcrypt.hash('google_oauth_user', 10);

      const [result] = await pool.query(
        `INSERT INTO users (google_sub, username, email, name, password_hash, picture_url, role_id, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [googleSub, email, email, name, dummyHash, picture, employeeRoleId]
      );
      userId = result.insertId;
      userRole = 'employee';
    }

    // 3. Generate our own JWT Access Token for the session
    const accessToken = jwt.sign(
      { id: userId, role: userRole, email: email }, 
      process.env.JWT_ACCESS_SECRET, 
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // 4. Set HttpOnly Cookies (This logs them in!)
    res.cookie('accessToken', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    res.json({ 
      user: { id: userId, email, name, picture, role: userRole } 
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

export default router;