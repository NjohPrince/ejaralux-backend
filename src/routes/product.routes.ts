import { Router } from "express";

import {
  createProductHandler,
  deleteProductHandler,
  getProductHandler,
  getProductsHandler,
  updateProductHandler,
} from "../controllers/product.controller";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema";
import { requireUser } from "../middleware/require-user";
import { requireAdminRole } from "../middleware/check-role";
import { validate } from "../middleware/validate";
import { RoleEnumType } from "../entities/user.entity";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               quantity: { type: number }
 *               unit: { type: string, enum: ["mL", "g", "pcs", "set"] }
 *               categoryId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  requireUser,
  requireAdminRole(RoleEnumType.ADMIN),
  validate(createProductSchema),
  createProductHandler
);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products (paginated)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: "Page number (default: 1)"
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       name: { type: string }
 *                       price: { type: number }
 *                       quantity: { type: number }
 *                       unit: { type: string }
 *                       category:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           name: { type: string }
 *                 hasMore:
 *                   type: boolean
 */
router.get("/", getProductsHandler);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Not found
 */
router.get("/:id", getProductHandler);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               quantity: { type: number }
 *               unit: { type: string, enum: ["mL", "g", "pcs", "set"] }
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 */
router.patch(
  "/:id",
  requireUser,
  requireAdminRole(RoleEnumType.ADMIN),
  validate(updateProductSchema),
  updateProductHandler
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  requireUser,
  requireAdminRole(RoleEnumType.ADMIN),
  deleteProductHandler
);

export default router;
