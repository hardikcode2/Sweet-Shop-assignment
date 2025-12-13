import { pool } from "../../src/db";

export async function resetDb() {
  await pool.query("DELETE FROM sweets");
  await pool.query("DELETE FROM users");
}
