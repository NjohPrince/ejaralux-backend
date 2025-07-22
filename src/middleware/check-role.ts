import { Request, Response, NextFunction } from "express";

import AppError from "../utils/app-error.util";
import { RoleEnumType } from "../entities/user.entity";

export const requireAdminRole = (role: RoleEnumType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user || user.role !== role) {
      return next(
        new AppError(403, `You do not have permission to perform this action`)
      );
    }

    next();
  };
};
