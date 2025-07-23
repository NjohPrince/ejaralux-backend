import { Request, Response, NextFunction } from "express";

import { ProductService } from "../services/product.service";

const productService = new ProductService();

export const createProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const imagePath = req.file?.path || "";
    const product = await productService.createProduct({
      ...req.body,
      price: parseFloat(req.body.price),
      quantity: parseInt(req.body.quantity),
      image: imagePath,
    });
    return res.status(201).json({ status: "success", data: product });
  } catch (err) {
    next(err);
  }
};

export const getProductsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const categoryId = req.query.categoryId as string | undefined;

    const result = await productService.getAllProducts({
      page,
      limit,
      categoryId,
    });

    return res.status(200).json({
      status: "success",
      data: result.products,
      total: result.total,
      page: result.page,
      limit: result.limit,
      isLastPage: result.isLastPage,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return res.status(200).json({ status: "success", data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await productService.updateProduct(req.params.id, req.body);
    return res.status(200).json({ status: "success", data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteProductHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await productService.deleteProduct(req.params.id);
    return res
      .status(200)
      .json({ status: "success", message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};
