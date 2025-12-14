import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { createSweetSchema, updateSweetSchema } from "./sweets.schemas";
import * as sweetsService from "./sweets.service";
import { HttpError } from "../errors/httpError";
import * as inventoryService from "./sweets.inventory.service";
import * as searchService from "./sweets.search.service";


export const sweetsRouter = Router();

/* ---------- LIST SWEETS ---------- */
sweetsRouter.get("/", requireAuth, async (_req, res, next) => {
  try {
    const sweets = await sweetsService.listSweets();
    res.status(200).json(sweets);
  } catch (err) {
    next(err);
  }
});

/* ---------- CREATE SWEET ---------- */
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

/* ---------- UPDATE SWEET ---------- */
sweetsRouter.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const parsed = updateSweetSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new HttpError(400, `Invalid request body: ${errors}`);
    }

    const sweet = await sweetsService.updateSweet(req.params.id, parsed.data);
    res.status(200).json(sweet);
  } catch (err) {
    next(err);
  }
});

/* ---------- SEARCH SWEETS ---------- */
sweetsRouter.get(
  "/search",
  requireAuth,
  async (req, res, next) => {
    try {
      const sweets = await searchService.searchSweets({
        name: req.query.name as string | undefined,
        category: req.query.category as string | undefined,
        minPrice: req.query.minPrice
          ? Number(req.query.minPrice)
          : undefined,
        maxPrice: req.query.maxPrice
          ? Number(req.query.maxPrice)
          : undefined,
      });

      res.status(200).json(sweets);
    } catch (err) {
      next(err);
    }
  }
);


/* ---------- DELETE SWEET (ADMIN ONLY) ---------- */
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

/* ---------- PURCHASE SWEET ---------- */
sweetsRouter.post(
  "/:id/purchase",
  requireAuth,
  async (req, res, next) => {
    try {
      const sweet = await inventoryService.purchaseSweet(req.params.id);
      res.status(200).json(sweet);
    } catch (err) {
      next(err);
    }
  }
);

/* ---------- RESTOCK SWEET (ADMIN ONLY) ---------- */
sweetsRouter.post(
  "/:id/restock",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const amount = Number(req.body.amount);
      if (!Number.isInteger(amount)) {
        throw new HttpError(400, "Invalid restock amount");
      }

      const sweet = await inventoryService.restockSweet(
        req.params.id,
        amount
      );
      res.status(200).json(sweet);
    } catch (err) {
      next(err);
    }
  }
);
