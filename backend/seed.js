import bcrypt from 'bcryptjs';
import { pool } from './src/db.js';

async function seed() {
  try {
    // 1. Ensure the administrator role exists
    await pool.query(`
      INSERT IGNORE INTO roles (slug, name) 
      VALUES ('administrator', 'Administrator')
    `);

    // 2. Get the role ID
    const [roles] = await pool.query(`SELECT id FROM roles WHERE slug = 'administrator'`);
    if (roles.length === 0) throw new Error('Could not find or create administrator role');
    const roleId = roles[0].id;

    // 3. Create the admin user
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (username, email, password_hash, role_id) 
      VALUES ('admin', 'admin@hrmis.gov', ?, ?)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
    `, [hash, roleId]);
    
    console.log('✅ Admin created: admin / admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();