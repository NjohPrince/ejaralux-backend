import express from "express";

import {
  loginUserHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { createUserSchema, loginUserSchema } from "../schemas/auth.schema";
import { requireUser } from "../middleware/require-user";
import { deserializeUser } from "../middleware/deserialize-user";

const router = express.Router();

router.post("/register", validate(createUserSchema), registerUserHandler);

router.post("/login", validate(loginUserSchema), loginUserHandler);

router.get("/logout", deserializeUser, requireUser, logoutHandler);

router.get("/refresh", refreshAccessTokenHandler);

export default router;
