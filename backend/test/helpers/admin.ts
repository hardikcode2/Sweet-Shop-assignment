import { pool } from "../../src/db";
import bcrypt from "bcryptjs";

export async function createAdminUser() {
  const passwordHash = await bcrypt.hash("AdminPass123!", 10);

  const res = await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ('admin@x.com', $1, 'ADMIN')
     RETURNING id`,
    [passwordHash]
  );

  return res.rows[0].id;
}
