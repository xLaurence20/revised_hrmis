import express from 'express';
import { pool } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all employees (with dept and position)
router.get('/', authenticate, authorize('employee.read'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, d.name as department_name, p.title as position_title 
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.is_active = 1
      ORDER BY e.last_name ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create employee
// Create employee
router.post('/', authenticate, authorize('employee.create'), async (req, res) => {
  const { employee_no, first_name, last_name, department_id, position_id, date_hired, employment_status, email, birth_date } = req.body;
  
  // Auto-generate employee_no if missing (e.g., EMP-1712345678)
  const empNo = employee_no || `EMP-${Date.now().toString().slice(-6)}`;

  try {
    const [result] = await pool.query(`
      INSERT INTO employees (employee_no, first_name, last_name, email, birth_date, department_id, position_id, date_hired, employment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [empNo, first_name, last_name, email || null, birth_date || null, department_id || null, position_id || null, date_hired || new Date(), employment_status || 'regular']);
    
    res.status(201).json({ id: result.insertId, message: 'Employee registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get meta data (departments & positions) for dropdowns
router.get('/meta', authenticate, async (req, res) => {
  try {
    const [depts] = await pool.query('SELECT id, name FROM departments WHERE is_active=1');
    const [pos] = await pool.query('SELECT id, title FROM positions WHERE is_active=1');
    res.json({ departments: depts, positions: pos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;