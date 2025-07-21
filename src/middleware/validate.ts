import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject, ZodRawShape } from "zod";

export const validate =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "fail",
          errors: error.issues,
        });
      }
      return next(error);
    }
  };
