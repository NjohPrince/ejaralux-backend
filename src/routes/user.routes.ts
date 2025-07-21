import express from "express";

import { getMeHandler } from "../controllers/user.controller";
import { requireUser } from "../middleware/require-user";
import { deserializeUser } from "../middleware/deserialize-user";

const router = express.Router();

router.use(deserializeUser, requireUser);

router.get("/me", getMeHandler);

export default router;
