import { NextFunction, Request, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";

import { findUserById } from "../services/user.service";
import AppError from "../utils/app-error.util";
import { verifyJwt } from "../utils/jwt.util";
import redisClient from "../utils/connect-redis.util";

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let access_token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      access_token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.access_token) {
      access_token = req.cookies.access_token;
    }

    if (!access_token) {
      return next(new AppError(401, "You are not logged in"));
    }

    let decoded;
    try {
      decoded = verifyJwt<{ sub: string }>(
        access_token,
        "accessTokenPublicKey"
      );
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return next(
          new AppError(401, "Access token expired", "ACCESS_TOKEN_EXPIRED")
        );
      } else {
        return next(new AppError(401, "Invalid access token"));
      }
    }

    const session = await redisClient.get(decoded?.sub || "");

    if (!session) {
      return next(
        new AppError(
          401,
          `Invalid token or session has expired`,
          "ACCESS_TOKEN_EXPIRED"
        )
      );
    }

    const user = await findUserById(JSON.parse(session).id);

    if (!user) {
      return next(
        new AppError(
          401,
          `Invalid token or session has expired`,
          "ACCESS_TOKEN_EXPIRED"
        )
      );
    }

    res.locals.user = user;

    next();
  } catch (err: any) {
    next(err);
  }
};
