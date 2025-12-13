"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = initDb;
const db_1 = require("../db");
async function initDb() {
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'USER'
    );

    CREATE TABLE IF NOT EXISTS sweets (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price NUMERIC NOT NULL,
      quantity INTEGER NOT NULL
    );
  `);
}
