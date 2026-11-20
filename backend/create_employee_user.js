import bcrypt from 'bcryptjs';
import { pool } from './src/db.js';

async function createEmployee() {
  try {
    // 1. Create Employee
    const [empResult] = await pool.query(`
      INSERT INTO employees (employee_no, first_name, last_name, date_hired) 
      VALUES ('EMP-001', 'John', 'Doe', '2026-01-01')
    `);
    const employeeId = empResult.insertId;

    // 2. Hash password
    const hash = await bcrypt.hash('employee123', 10);

    // 3. Create User linked to Employee
    await pool.query(`
      INSERT INTO users (username, email, password_hash, role_id, employee_id) 
      VALUES ('johndoe', 'john@hrmis.gov', ?, (SELECT id FROM roles WHERE slug = 'employee'), ?)
    `, [hash, employeeId]);
    
    console.log('✅ Employee User created: johndoe / employee123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}
createEmployee();