import { pool } from "../db";
import { HttpError } from "../errors/httpError";

export async function listSweets() {
  const result = await pool.query(
    `SELECT id, name, category, price, quantity FROM sweets`
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

export async function updateSweet(
  id: string,
  data: {
    name: string;
    category: string;
    price: number;
    quantity: number;
  }
) {
  const result = await pool.query(
    `UPDATE sweets
     SET name=$1, category=$2, price=$3, quantity=$4
     WHERE id=$5
     RETURNING id, name, category, price, quantity`,
    [data.name, data.category, data.price, data.quantity, id]
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, "Sweet not found");
  }

  return result.rows[0];
}

export async function deleteSweet(id: string) {
  const result = await pool.query(
    `DELETE FROM sweets WHERE id=$1`,
    [id]
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, "Sweet not found");
  }
}
