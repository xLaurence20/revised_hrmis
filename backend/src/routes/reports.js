import express from 'express';
import { pool } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Dashboard Analytics
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const [[{ totalEmployees }]] = await pool.query('SELECT COUNT(*) as totalEmployees FROM employees WHERE is_active = 1');
    const [[{ pendingLeaves }]] = await pool.query("SELECT COUNT(*) as pendingLeaves FROM leave_applications WHERE status = 'pending'");
    const [[{ approvedLeaves }]] = await pool.query("SELECT COUNT(*) as approvedLeaves FROM leave_applications WHERE status = 'approved'");
    
    res.json({ totalEmployees, pendingLeaves, approvedLeaves });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get full details for COE
router.get('/coe/:employeeId', authenticate, authorize('report.generate'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, d.name as department_name, p.title as position_title 
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.id = ?
    `, [req.params.employeeId]);

    if (!rows.length) return res.status(404).json({ error: 'Employee not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;