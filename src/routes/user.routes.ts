import express from "express";

import { getMeHandler } from "../controllers/user.controller";
import { requireUser } from "../middleware/require-user";
import { deserializeUser } from "../middleware/deserialize-user";

const router = express.Router();

router.use(deserializeUser, requireUser);

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User endpoints
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get currently authenticated user information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: The authenticated user
 *                       example:
 *                         id: "1234"
 *                         email: "user@example.com"
 *                         firstName: "John"
 *                         lastName: "Doe"
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.get("/me", getMeHandler);

export default router;
