import { z } from "zod";

export const orderItemInputSchema = z.object({
  body: z.object({
    productId: z.uuid(),
    quantity: z.number().int().positive(),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(orderItemInputSchema).min(1),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refund_requested",
      "refunded",
    ]),
  }),
});
