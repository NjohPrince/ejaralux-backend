import { Request, Response, NextFunction } from "express";

import * as categoryService from "../services/category.service";
import AppError from "../utils/app-error.util";

export const createCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await categoryService.createCategory(req.body.name);
    return res.status(201).json({ status: "success", data: category });
  } catch (err) {
    next(err);
  }
};

export const getAllCategoriesHandler = async (_req: Request, res: Response) => {
  const categories = await categoryService.findAllCategories();
  res.json({ status: "success", data: categories });
};

export const getCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const category = await categoryService.findCategoryById(req.params.id);
  if (!category) return next(new AppError(404, "Category not found"));
  res.json({ status: "success", data: category });
};

export const updateCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const updated = await categoryService.updateCategory(
    req.params.id,
    req.body.name
  );
  if (!updated) return next(new AppError(404, "Category not found"));
  res.json({ status: "success", data: updated });
};

export const deleteCategoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await categoryService.deleteCategory(req.params.id);
  if (!result.affected) return next(new AppError(404, "Category not found"));
  res.status(204).send();
};
