import request from "supertest";
import { createApp } from "../src/app";
import { pool } from "../src/db";
import { resetDb } from "./helpers/db";
import { registerAndLogin } from "./helpers/auth";
import { createAdminUser } from "./helpers/admin";

describe("Sweets API – update & delete", () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  async function createSweet() {
    const res = await pool.query(
      `INSERT INTO sweets (name, category, price, quantity)
       VALUES ('Peda', 'Indian', 20, 5)
       RETURNING id`
    );
    return res.rows[0].id;
  }

  describe("PUT /api/sweets/:id", () => {
    it("updates sweet when authenticated", async () => {
      const token = await registerAndLogin(app, "u@x.com", "Password123!");
      const sweetId = await createSweet();

      const res = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Milk Peda",
          category: "Indian",
          price: 25,
          quantity: 10
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Milk Peda");
      expect(res.body.quantity).toBe(10);
    });

    it("returns 404 if sweet does not exist", async () => {
      const token = await registerAndLogin(app, "u2@x.com", "Password123!");

      const res = await request(app)
        .put("/api/sweets/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Ghost",
          category: "None",
          price: 1,
          quantity: 1
        });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/sweets/:id", () => {
    it("forbids non-admin users", async () => {
      const token = await registerAndLogin(app, "user@x.com", "Password123!");
      const sweetId = await createSweet();

      const res = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it("allows admin to delete sweet", async () => {
      await createAdminUser();

      const adminLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin@x.com", password: "AdminPass123!" });

      const token = adminLogin.body.token;
      const sweetId = await createSweet();

      const res = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);
    });
  });
});
