import { pool } from "../db";
import { HttpError } from "../errors/httpError";

export async function purchaseSweet(id: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const res = await client.query(
      `SELECT quantity FROM sweets WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (res.rowCount === 0) {
      throw new HttpError(404, "Sweet not found");
    }

    if (res.rows[0].quantity <= 0) {
      throw new HttpError(400, "Out of stock");
    }

    const updated = await client.query(
      `UPDATE sweets
       SET quantity = quantity - 1
       WHERE id = $1
       RETURNING id, name, category, price, quantity`,
      [id]
    );

    await client.query("COMMIT");
    return updated.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function restockSweet(id: string, amount: number) {
  if (amount <= 0) {
    throw new HttpError(400, "Invalid restock amount");
  }

  const res = await pool.query(
    `UPDATE sweets
     SET quantity = quantity + $1
     WHERE id = $2
     RETURNING id, name, category, price, quantity`,
    [amount, id]
  );

  if (res.rowCount === 0) {
    throw new HttpError(404, "Sweet not found");
  }

  return res.rows[0];
}
