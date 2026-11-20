import express from 'express';
import { pool } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/compute', authenticate, authorize('tlb.compute'), async (req, res) => {
  const { employeeId, separationDate, separationType, deductions } = req.body;

  try {
    // 1. Fetch Employee Data
    const [empRows] = await pool.query('SELECT first_name, last_name, employee_no FROM employees WHERE id = ?', [employeeId]);
    if (!empRows.length) return res.status(404).json({ error: 'Employee not found' });
    const employee = empRows[0];

    // 2. Fetch Highest Monthly Salary from History
    const [salaryRows] = await pool.query(`
      SELECT basic_salary, effective_date, position_title 
      FROM salary_histories 
      WHERE employee_id = ? 
      ORDER BY basic_salary DESC LIMIT 1
    `, [employeeId]);

    if (!salaryRows.length) return res.status(400).json({ error: 'No salary history found for this employee.' });
    const highestSalaryRef = salaryRows[0];
    const highestSalary = parseFloat(highestSalaryRef.basic_salary);

    // 3. Fetch Leave Credits (Allow decimals up to 3 places)
    const [ledgerRows] = await pool.query('SELECT vl_balance, sl_balance FROM leave_credit_ledgers WHERE employee_id = ?', [employeeId]);
    const vl = ledgerRows.length ? parseFloat(ledgerRows[0].vl_balance) : 0;
    const sl = ledgerRows.length ? parseFloat(ledgerRows[0].sl_balance) : 0;
    const totalCredits = vl + sl;

    // 4. Compute TLB
    const CONSTANT_FACTOR = 0.0481927;
    const grossTLB = highestSalary * totalCredits * CONSTANT_FACTOR;
    const roundedGross = Math.round(grossTLB * 100) / 100;
    
    const authorizedDeductions = parseFloat(deductions) || 0;
    const netTLB = roundedGross - authorizedDeductions;

    res.json({
      employee: {
        name: `${employee.first_name} ${employee.last_name}`,
        employee_no: employee.employee_no
      },
      separation: {
        date: separationDate,
        type: separationType
      },
      salaryReference: {
        amount: highestSalary.toFixed(2),
        date: highestSalaryRef.effective_date,
        position: highestSalaryRef.position_title
      },
      leaveCredits: {
        vl: vl.toFixed(3),
        sl: sl.toFixed(3),
        total: totalCredits.toFixed(3)
      },
      computation: {
        constantFactor: CONSTANT_FACTOR,
        grossTLB: roundedGross.toFixed(2),
        taxExempt: true,
        deductions: authorizedDeductions.toFixed(2),
        netTLB: netTLB.toFixed(2)
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;