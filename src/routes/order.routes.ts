import express from "express";
import {
  createOrderHandler,
  getAllOrdersHandler,
  getMyOrdersHandler,
  updateOrderStatusHandler,
} from "../controllers/order.controller";
import { deserializeUser } from "../middleware/deserialize-user";
import { requireUser } from "../middleware/require-user";
import { validate } from "../middleware/validate";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../schemas/order.schema";
import { requireAdminRole } from "../middleware/check-role";
import { RoleEnumType } from "../entities/user.entity";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post(
  "/",
  deserializeUser,
  requireUser,
  validate(createOrderSchema),
  createOrderHandler
);

/**
 * @swagger
 * /orders/me:
 *   get:
 *     summary: Get user's order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user's orders
 */
router.get("/me", deserializeUser, requireUser, getMyOrdersHandler);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Admin - get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get(
  "/",
  deserializeUser,
  requireUser,
  requireAdminRole(RoleEnumType.ADMIN),
  getAllOrdersHandler
);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Admin - update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled, refund_requested, refunded]
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.patch(
  "/:id/status",
  deserializeUser,
  requireUser,
  requireAdminRole(RoleEnumType.ADMIN),
  validate(updateOrderStatusSchema),
  updateOrderStatusHandler
);

export default router;
