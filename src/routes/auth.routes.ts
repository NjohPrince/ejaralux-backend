import express from "express";

import {
  forgotPasswordHandler,
  loginUserHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerUserHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { createUserSchema, forgotPasswordSchema, loginUserSchema, resetPasswordSchema } from "../schemas/auth.schema";
import { requireUser } from "../middleware/require-user";
import { deserializeUser } from "../middleware/deserialize-user";
import { loginLimiter, signupLimiter } from "../middleware/rate-limiters";
import { verifyEmailSchema } from "../schemas/v-email.schema";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - password
 *               - passwordConfirm
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/register",
  signupLimiter,
  validate(createUserSchema),
  registerUserHandler
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  loginLimiter,
  validate(loginUserSchema),
  loginUserHandler
);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout user by clearing tokens and session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 */
router.get("/logout", deserializeUser, requireUser, logoutHandler);

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Refresh access token using refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 access_token:
 *                   type: string
 *                   description: New JWT access token
 *       403:
 *         description: Forbidden - invalid or missing refresh token
 */
router.get("/refresh", refreshAccessTokenHandler);

/**
 * @swagger
 * /auth/verifyemail/{verificationCode}:
 *   get:
 *     summary: Verify a user's email address using a verification code
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: verificationCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Hashed verification code sent to the user's email
 *     responses:
 *       200:
 *         description: Email verified successfully or already verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *       400:
 *         description: Invalid or expired verification link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Verification link is invalid or expired
 *       404:
 *         description: Verification code not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Could not verify email
 */
router.get(
  "/verifyemail/:verificationCode",
  validate(verifyEmailSchema),
  verifyEmailHandler
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset email sent
 *       404:
 *         description: No user found
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPasswordHandler);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123token
 *               password:
 *                 type: string
 *                 example: newpassword123
 *               passwordConfirm:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or expired
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/reset-password", validate(resetPasswordSchema), resetPasswordHandler);

export default router;
