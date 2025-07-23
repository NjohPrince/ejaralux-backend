import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1),
    price: z.number().positive("Price must be a positive number"),
    quantity: z.number().int().min(0),
    unit: z.enum(["mL", "g", "pcs", "set"]),
    categoryId: z.uuid(),
  }),
});

export const updateProductSchema = createProductSchema.partial();
