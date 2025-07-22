// src/routes/category.routes.ts
import express from "express";
import {
  createCategoryHandler,
  getAllCategoriesHandler,
  getCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from "../controllers/category.controller";
import { validate } from "../middleware/validate";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema";
import { deserializeUser } from "../middleware/deserialize-user";
import { requireUser } from "../middleware/require-user";
import { requireAdminRole } from "../middleware/check-role";
import { RoleEnumType } from "../entities/user.entity";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", getAllCategoriesHandler);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Found category
 *       404:
 *         description: Not found
 */
router.get("/:id", getCategoryHandler);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  "/",
  deserializeUser,
  requireUser,
  requireAdminRole(RoleEnumType.ADMIN),
  validate(createCategorySchema),
  createCategoryHandler
);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.patch(
  "/:id",
  deserializeUser,
  requireUser,
  requireAdminRole(RoleEnumType.ADMIN),
  validate(updateCategorySchema),
  updateCategoryHandler
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete(
  "/:id",
  deserializeUser,
  requireUser,
  requireAdminRole(RoleEnumType.ADMIN),
  deleteCategoryHandler
);

export default router;
