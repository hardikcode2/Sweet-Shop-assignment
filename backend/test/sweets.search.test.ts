import request from "supertest";
import { createApp } from "../src/app";
import { pool } from "../src/db";
import { resetDb } from "./helpers/db";
import { registerAndLogin } from "./helpers/auth";

describe("Sweets Search API", () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query(`
      INSERT INTO sweets (name, category, price, quantity)
      VALUES
      ('Ladoo', 'Indian', 10, 5),
      ('Barfi', 'Indian', 12, 3),
      ('Chocolate', 'Western', 20, 10)
    `);
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/sweets/search");
    expect(res.status).toBe(401);
  });

  it("filters by name", async () => {
    const token = await registerAndLogin(app, "s1@x.com", "Password123!");

    const res = await request(app)
      .get("/api/sweets/search?name=lad")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Ladoo");
  });

  it("filters by category", async () => {
    const token = await registerAndLogin(app, "s2@x.com", "Password123!");

    const res = await request(app)
      .get("/api/sweets/search?category=Indian")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("filters by price range", async () => {
    const token = await registerAndLogin(app, "s3@x.com", "Password123!");

    const res = await request(app)
      .get("/api/sweets/search?minPrice=11&maxPrice=20")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});
