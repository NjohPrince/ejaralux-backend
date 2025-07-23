import { Request, Response, NextFunction } from "express";

import * as orderService from "../services/order.service";

export const createOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    const order = await orderService.createOrder(user.id, req.body.items);
    return res.status(201).json({ status: "success", data: order });
  } catch (err) {
    next(err);
  }
};

export const getMyOrdersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    const page = parseInt(req.query.page as string) || 1;
    const orders = await orderService.getOrderHistory(user.id, page);
    return res.json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllOrdersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const orders = await orderService.getAllOrders(page);
    return res.json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status
    );
    return res.json({ status: "success", data: updated });
  } catch (err) {
    next(err);
  }
};
