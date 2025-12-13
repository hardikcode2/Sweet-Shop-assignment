import { pool } from "../db";

export async function listSweets() {
  const result = await pool.query(
    `SELECT id, name, category, price, quantity
     FROM sweets`
  );
  return result.rows;
}

export async function createSweet(data: {
  name: string;
  category: string;
  price: number;
  quantity: number;
}) {
  const result = await pool.query(
    `INSERT INTO sweets (name, category, price, quantity)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, category, price, quantity`,
    [data.name, data.category, data.price, data.quantity]
  );

  return result.rows[0];
}
