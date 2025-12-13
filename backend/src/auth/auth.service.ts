import { pool } from "../db";
import { HttpError } from "../errors/httpError";
import { hashPassword, verifyPassword } from "../utils/password";
import { signJwt } from "../utils/jwt";

export async function register(email: string, password: string) {
  const passwordHash = await hashPassword(password);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, role`,
      [email, passwordHash]
    );

    const user = result.rows[0];
    return { token: signJwt({ sub: user.id, role: user.role }) };
  } catch (e: any) {
    if (e.code === "23505") {
      throw new HttpError(409, "Email already exists");
    }
    throw e;
  }
}

export async function login(email: string, password: string) {
  const result = await pool.query(
    `SELECT id, password_hash, role FROM users WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) throw new HttpError(401, "Invalid credentials");

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) throw new HttpError(401, "Invalid credentials");

  return { token: signJwt({ sub: user.id, role: user.role }) };
}
