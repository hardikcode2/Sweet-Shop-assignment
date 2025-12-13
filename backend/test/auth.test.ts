import request from "supertest";
import { createApp } from "../src/app";
import { pool } from "../src/db";
import { resetDb } from "./helpers/db";

describe("Auth API", () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("POST /api/auth/register", () => {
    it("registers a user and returns a token", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "a@b.com", password: "Password123!" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
    });

    it("rejects invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "invalid", password: "Password123!" });

      expect(res.status).toBe(400);
    });

    it("rejects duplicate email", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ email: "dup@x.com", password: "Password123!" });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "dup@x.com", password: "Password123!" });

      expect(res.status).toBe(409);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in and returns a token", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ email: "login@x.com", password: "Password123!" });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "login@x.com", password: "Password123!" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("rejects wrong password", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ email: "wp@x.com", password: "Password123!" });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "wp@x.com", password: "WrongPassword!" });

      expect(res.status).toBe(401);
    });

    it("rejects unknown user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nouser@x.com", password: "Password123!" });

      expect(res.status).toBe(401);
    });
  });
});
