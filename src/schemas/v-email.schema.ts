import { z } from "zod";

export const verifyEmailSchema = z.object({
  params: z.object({
    verificationCode: z.string(),
  }),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>["params"];
