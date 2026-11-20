import express from 'express';
import { pool } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get Leaves (Role-based filtering)
router.get('/', authenticate, async (req, res) => {
  try {
    // If user is employee, only show their leaves. If reviewer/approver/admin, show all.
    const isAdmin = ['administrator', 'hr_personnel', 'reviewer', 'final_approver'].includes(req.user.role);
    
    let query = `
      SELECT l.*, e.first_name, e.last_name, e.employee_no 
      FROM leave_applications l
      JOIN employees e ON l.employee_id = e.id
    `;
    let params = [];

    if (!isAdmin) {
      // Find the employee_id of the logged-in user
      const [userRec] = await pool.query('SELECT employee_id FROM users WHERE id = ?', [req.user.id]);
      if (!userRec[0]?.employee_id) return res.json([]); // No employee profile linked
      
      query += ' WHERE l.employee_id = ?';
      params.push(userRec[0].employee_id);
    }

    query += ' ORDER BY l.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit Leave
router.post('/', authenticate, authorize('leave.apply'), async (req, res) => {
  const { leave_type, start_date, end_date, days, reason, target_employee_id } = req.body;
  
  try {
    let employee_id = target_employee_id;
    // If not admin, force using their own linked employee_id
    if (req.user.role === 'employee') {
      const [userRec] = await pool.query('SELECT employee_id FROM users WHERE id = ?', [req.user.id]);
      employee_id = userRec[0]?.employee_id;
    }

    if (!employee_id) return res.status(400).json({ error: 'No employee profile linked to this user.' });

    await pool.query(`
      INSERT INTO leave_applications (employee_id, leave_type, start_date, end_date, days, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [employee_id, leave_type, start_date, end_date, days, reason]);
    
    res.status(201).json({ message: 'Leave application submitted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Action (Approve/Reject/Review) - TRANSACTIONAL
router.put('/:id/action', authenticate, authorize('leave.approve'), async (req, res) => {
  const { action, status } = req.body; // action: 'review', 'approve', 'reject'
  const leaveId = req.params.id;
  const conn = await pool.getConnection();

    try {
    await conn.beginTransaction();

    // 1. Get the application
    const [apps] = await conn.query('SELECT * FROM leave_applications WHERE id = ? FOR UPDATE', [leaveId]);
    if (!apps.length) throw new Error('Leave application not found');
    const app = apps[0];

    if (app.status === 'approved' || app.status === 'rejected') {
      throw new Error('Application is already finalized.');
    }

    // 2. Update Status (Using SINGLE QUOTES for string values)
    if (action === 'review') {
      await conn.query("UPDATE leave_applications SET status = 'reviewed', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?", [req.user.id, leaveId]);
    } 
    else if (action === 'reject') {
      await conn.query("UPDATE leave_applications SET status = 'rejected', approved_by = ?, approved_at = NOW() WHERE id = ?", [req.user.id, leaveId]);
    } 
    else if (action === 'approve') {
      // Deduct Credits
      const type = app.leave_type === 'vacation' ? 'vl_balance' : 'sl_balance';
      
      // Ensure ledger exists
      await conn.query('INSERT IGNORE INTO leave_credit_ledgers (employee_id) VALUES (?)', [app.employee_id]);
      
      // Deduct
      const [updateRes] = await conn.query(`
        UPDATE leave_credit_ledgers 
        SET ${type} = ${type} - ? 
        WHERE employee_id = ? AND ${type} >= ?
      `, [app.days, app.employee_id, app.days]);

      if (updateRes.affectedRows === 0) {
        throw new Error(`Insufficient ${type === 'vl_balance' ? 'Vacation' : 'Sick'} Leave credits.`);
      }

      await conn.query("UPDATE leave_applications SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?", [req.user.id, leaveId]);
    }

    await conn.commit();
    res.json({ message: `Leave ${action}ed successfully.` });
  } catch (error) {
    await conn.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    conn.release();
  }
});

// Add this route inside backend/src/routes/leaves.js
router.get('/my-balances', authenticate, async (req, res) => {
  try {
    // Find the logged-in user's employee_id
    const [userRec] = await pool.query('SELECT employee_id FROM users WHERE id = ?', [req.user.id]);
    if (!userRec[0]?.employee_id) return res.json({ vl: 0, sl: 0 });
    
    // Get ledger
    const [ledger] = await pool.query('SELECT vl_balance, sl_balance FROM leave_credit_ledgers WHERE employee_id = ?', [userRec[0].employee_id]);
    
    if (!ledger.length) {
      // If no ledger exists yet, return the default seed values
      return res.json({ vl: 15.000, sl: 15.000 }); 
    }
    res.json({ vl: ledger[0].vl_balance, sl: ledger[0].sl_balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;