import request from "supertest";
import { Express } from "express";

export async function registerAndLogin(
  app: Express,
  email: string,
  password: string
) {
  await request(app)
    .post("/api/auth/register")
    .send({ email, password });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.token as string;
}
