import request from "supertest";
import { createApp } from "../src/app";
import { pool } from "../src/db";
import { resetDb } from "./helpers/db";
import { registerAndLogin } from "./helpers/auth";

describe("Sweets API (protected)", () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("GET /api/sweets", () => {
    it("rejects requests without token", async () => {
      const res = await request(app).get("/api/sweets");
      expect(res.status).toBe(401);
    });

    it("returns sweets list when authenticated", async () => {
      const token = await registerAndLogin(app, "list@x.com", "Password123!");

      await pool.query(
        `INSERT INTO sweets (name, category, price, quantity)
         VALUES
         ('Ladoo', 'Indian', 10.00, 5),
         ('Barfi', 'Indian', 12.50, 0)`
      );

      const res = await request(app)
        .get("/api/sweets")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);

      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("name");
      expect(res.body[0]).toHaveProperty("category");
      expect(res.body[0]).toHaveProperty("price");
      expect(res.body[0]).toHaveProperty("quantity");
    });
  });

  describe("POST /api/sweets", () => {
    it("rejects requests without token", async () => {
      const res = await request(app).post("/api/sweets").send({
        name: "Jalebi",
        category: "Indian",
        price: 15,
        quantity: 10,
      });

      expect(res.status).toBe(401);
    });

    it("creates a sweet when authenticated", async () => {
      const token = await registerAndLogin(app, "create@x.com", "Password123!");

      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Jalebi",
          category: "Indian",
          price: 15,
          quantity: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("Jalebi");
      expect(res.body.category).toBe("Indian");
      expect(res.body.quantity).toBe(10);
    });

    it("rejects invalid sweet payload", async () => {
      const token = await registerAndLogin(app, "bad@x.com", "Password123!");

      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "",
          category: "",
          price: -1,
          quantity: -5,
        });

      expect(res.status).toBe(400);
    });
  });
});
