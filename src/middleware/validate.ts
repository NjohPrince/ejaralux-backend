import AppError from "../utils/app-error.util";

import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject, ZodRawShape } from "zod";

export const validate =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log("====================================");
    console.log({
      body: req.body,
    });
    console.log("====================================");
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join("; ");

        return next(new AppError(400, message));
      }

      return next(error);
    }
  };
