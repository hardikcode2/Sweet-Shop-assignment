import { pool } from "../db";

export async function initDb() {
  // Enable UUID extension
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'USER',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sweets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
      quantity INTEGER NOT NULL CHECK (quantity >= 0),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
