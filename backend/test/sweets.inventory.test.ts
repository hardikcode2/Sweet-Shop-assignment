import request from "supertest";
import { createApp } from "../src/app";
import { pool } from "../src/db";
import { resetDb } from "./helpers/db";
import { registerAndLogin } from "./helpers/auth";
import { createAdminUser } from "./helpers/admin";

describe("Sweets Inventory API", () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  async function createSweet(quantity = 2) {
    const res = await pool.query(
      `INSERT INTO sweets (name, category, price, quantity)
       VALUES ('Kaju Katli', 'Indian', 50, $1)
       RETURNING id`,
      [quantity]
    );
    return res.rows[0].id;
  }

  describe("POST /api/sweets/:id/purchase", () => {
    it("decreases quantity when in stock", async () => {
      const token = await registerAndLogin(app, "buyer@x.com", "Password123!");
      const sweetId = await createSweet(2);

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(1);
    });

    it("rejects purchase when out of stock", async () => {
      const token = await registerAndLogin(app, "buyer2@x.com", "Password123!");
      const sweetId = await createSweet(0);

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/sweets/:id/restock", () => {
    it("forbids non-admin users", async () => {
      const token = await registerAndLogin(app, "user@x.com", "Password123!");
      const sweetId = await createSweet(1);

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 5 });

      expect(res.status).toBe(403);
    });

    it("allows admin to restock", async () => {
      await createAdminUser();

      const adminLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin@x.com", password: "AdminPass123!" });

      const token = adminLogin.body.token;
      const sweetId = await createSweet(1);

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 5 });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(6);
    });
  });
});
