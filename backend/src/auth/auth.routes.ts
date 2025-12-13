import { Router } from "express";
import { registerSchema, loginSchema } from "./auth.schemas";
import * as authService from "./auth.service";
import { HttpError } from "../errors/httpError";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, "Invalid request body");

    const result = await authService.register(
      parsed.data.email,
      parsed.data.password
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, "Invalid request body");

    const result = await authService.login(
      parsed.data.email,
      parsed.data.password
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});
