import { z } from "zod";

export const createSweetSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
});

export const updateSweetSchema = createSweetSchema;
