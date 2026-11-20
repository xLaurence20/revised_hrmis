import express from 'express';
import { pool } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Calculate Terminal Leave Benefits
router.get('/calculate/:employeeId', authenticate, authorize('tlb.compute'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.first_name, e.last_name, e.monthly_salary, 
             COALESCE(l.vl_balance, 0) as vl, COALESCE(l.sl_balance, 0) as sl
      FROM employees e
      LEFT JOIN leave_credit_ledgers l ON e.id = l.employee_id
      WHERE e.id = ?
    `, [req.params.employeeId]);

    if (!rows.length) return res.status(404).json({ error: 'Employee not found' });
    const emp = rows[0];

    // Standard CSC Formula approximation: Total Credits * (Monthly Salary / 22)
    const totalCredits = parseFloat(emp.vl) + parseFloat(emp.sl);
    const dailyRate = parseFloat(emp.monthly_salary) / 22;
    const tlbAmount = totalCredits * dailyRate;

    res.json({
      employee: `${emp.first_name} ${emp.last_name}`,
      totalCredits,
      dailyRate: dailyRate.toFixed(2),
      tlbAmount: tlbAmount.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;