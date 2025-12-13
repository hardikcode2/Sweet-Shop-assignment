import { pool } from "../db";

type SearchParams = {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function searchSweets(params: SearchParams) {
  const conditions: string[] = [];
  const values: any[] = [];

  if (params.name) {
    values.push(`%${params.name}%`);
    conditions.push(`name ILIKE $${values.length}`);
  }

  if (params.category) {
    values.push(params.category);
    conditions.push(`category = $${values.length}`);
  }

  if (params.minPrice !== undefined) {
    values.push(params.minPrice);
    conditions.push(`price >= $${values.length}`);
  }

  if (params.maxPrice !== undefined) {
    values.push(params.maxPrice);
    conditions.push(`price <= $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT id, name, category, price, quantity
     FROM sweets
     ${whereClause}`,
    values
  );

  return result.rows;
}
