import { object, z } from "zod";

import { RoleEnumType } from "../entities/user.entity";

export const createUserSchema = object({
  body: object({
    firstName: z.string().nonempty("First name is required"),
    lastName: z.string().nonempty("Last name is required"),
    email: z.email().nonempty("Email address is required"),
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be more than 8 characters")
      .max(32, "Password must be less than 32 characters"),
    passwordConfirm: z.string().nonempty("Please confirm your password"),
    role: z.optional(z.enum(RoleEnumType)).default(RoleEnumType.USER),
  }).refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords do not match",
  }),
});

export const loginUserSchema = object({
  body: object({
    email: z.email().nonempty("Email address is required"),
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Invalid email or password"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email().nonempty("Email address is required"),
  }),
});

export const resetPasswordSchema = z
  .object({
    body: z.object({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
      passwordConfirm: z.string(),
      token: z.string().min(1, "Token is required"),
    }),
  })
  .refine((data) => data.body.password === data.body.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export type CreateUserInput = Omit<
  z.infer<typeof createUserSchema>["body"],
  "passwordConfirm"
>;

export type LoginUserInput = z.infer<typeof loginUserSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
