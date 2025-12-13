import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { pool } from "../db";
import { HttpError } from "../errors/httpError";

function signToken(payload: { sub: string; role: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  const expiresIn = process.env.JWT_EXPIRES_IN ?? "1h";

  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
}

export async function register(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, role`,
      [email, passwordHash]
    );

    const user = result.rows[0];
    const token = signToken({ sub: user.id, role: user.role });

    return { token };
  } catch (e: any) {
    // PostgreSQL unique constraint violation
    if (e.code === "23505") {
      throw new HttpError(409, "Email already exists");
    }
    throw e;
  }
}

export async function login(email: string, password: string) {
  const result = await pool.query(
    `SELECT id, password_hash, role
     FROM users
     WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) throw new HttpError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new HttpError(401, "Invalid credentials");

  const token = signToken({ sub: user.id, role: user.role });
  return { token };
}
