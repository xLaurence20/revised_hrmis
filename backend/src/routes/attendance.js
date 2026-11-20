import express from 'express';
import { pool } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Bulk ingest DTR logs
router.post('/ingest', authenticate, authorize('attendance.ingest'), async (req, res) => {
  const { logs } = req.body; // Array of { employee_id, log_date, time_in_am, ... }
  if (!logs || !Array.isArray(logs)) return res.status(400).json({ error: 'Invalid payload' });

  try {
    // Using ON DUPLICATE KEY UPDATE to handle re-uploads safely
    const values = logs.map(l => [
      l.employee_id, l.log_date, l.time_in_am || null, l.time_out_am || null, l.time_in_pm || null, l.time_out_pm || null
    ]);
    
    await pool.query(`
      INSERT INTO dtr_logs (employee_id, log_date, time_in_am, time_out_am, time_in_pm, time_out_pm)
      VALUES ?
      ON DUPLICATE KEY UPDATE 
        time_in_am = VALUES(time_in_am), time_out_am = VALUES(time_out_am),
        time_in_pm = VALUES(time_in_pm), time_out_pm = VALUES(time_out_pm)
    `, [values]);

    res.json({ message: `Successfully ingested ${logs.length} records.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get DTR logs for a specific month
router.get('/logs', authenticate, authorize('attendance.read'), async (req, res) => {
  const { month, year, employee_id } = req.query;
  try {
    let query = `
      SELECT d.*, e.first_name, e.last_name, e.employee_no 
      FROM dtr_logs d
      JOIN employees e ON d.employee_id = e.id
      WHERE MONTH(d.log_date) = ? AND YEAR(d.log_date) = ?
    `;
    const params = [month, year];

    if (employee_id) {
      query += ' AND d.employee_id = ?';
      params.push(employee_id);
    }

    query += ' ORDER BY d.log_date DESC, e.last_name ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;