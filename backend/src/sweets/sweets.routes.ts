import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { createSweetSchema, updateSweetSchema } from "./sweets.schemas";
import * as sweetsService from "./sweets.service";
import { HttpError } from "../errors/httpError";

export const sweetsRouter = Router();

sweetsRouter.get("/", requireAuth, async (_req, res, next) => {
  try {
    const sweets = await sweetsService.listSweets();
    res.status(200).json(sweets);
  } catch (err) {
    next(err);
  }
});

sweetsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const parsed = createSweetSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, "Invalid request body");

    const sweet = await sweetsService.createSweet(parsed.data);
    res.status(201).json(sweet);
  } catch (err) {
    next(err);
  }
});

sweetsRouter.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const parsed = updateSweetSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, "Invalid request body");

    const sweet = await sweetsService.updateSweet(req.params.id, parsed.data);
    res.status(200).json(sweet);
  } catch (err) {
    next(err);
  }
});

sweetsRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      await sweetsService.deleteSweet(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);
