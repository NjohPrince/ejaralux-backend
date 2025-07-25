import config from "config";
import { CookieOptions, NextFunction, Request, Response } from "express";
import crypto from "crypto";

import {
  CreateUserInput,
  ForgotPasswordInput,
  LoginUserInput,
  ResetPasswordInput,
} from "../schemas/auth.schema";
import {
  createUser,
  findUser,
  findUserByEmail,
  findUserById,
  signTokens,
} from "../services/user.service";
import { RoleEnumType, User } from "../entities/user.entity";
import AppError from "../utils/app-error.util";
import { signJwt, verifyJwt } from "../utils/jwt.util";
import redisClient from "../utils/connect-redis.util";
import Email from "../utils/email.util";
import { VerifyEmailInput } from "../schemas/v-email.schema";
import { AppDataSource } from "../utils/data-source.util";
import { catchAsync } from "../utils/catch-async.util";
import { MoreThan } from "typeorm";

const userRepo = AppDataSource.getRepository(User);

const cookiesOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
};

if (process.env.NODE_ENV === "production") cookiesOptions.secure = true;

const accessTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>("accessTokenExpiresIn") * 60 * 1000
  ),
  maxAge: config.get<number>("accessTokenExpiresIn") * 60 * 1000,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>("refreshTokenExpiresIn") * 60 * 1000
  ),
  maxAge: config.get<number>("refreshTokenExpiresIn") * 60 * 1000,
};

export const registerUserHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  const dataSource = AppDataSource;
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { firstName, lastName, password, email } = req.body;

    const user = queryRunner.manager.create(User, {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: req.body.role || RoleEnumType.USER,
    });

    const { hashedVerificationCode, verificationCode } =
      User.createVerificationCode();
    user.verificationCode = hashedVerificationCode;

    await queryRunner.manager.save(user);

    const redirectUrl = `${config.get<string>(
      "origin"
    )}/auth/verify-email?verificationCode=${verificationCode}`;

    try {
      await new Email(user, redirectUrl).sendVerificationCode();
      await queryRunner.commitTransaction();

      return res.status(201).json({
        status: "success",
        message:
          "An email with a verification link has been sent to your email",
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log("====================================");
      console.log({ error });
      console.log("====================================");
      return res.status(500).json({
        status: "error",
        message: "There was an error sending email, please try again",
      });
    }
  } catch (err: any) {
    await queryRunner.rollbackTransaction();

    if (err.code === "23505") {
      return res.status(409).json({
        status: "fail",
        message: "User with that email already exists",
      });
    }

    next(err);
  } finally {
    await queryRunner.release();
  }
};

export const loginUserHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail({ email });

    if (!user) {
      return next(new AppError(400, "Invalid email or password"));
    }

    if (!user.verified) {
      return next(new AppError(400, "Please verify your email"));
    }

    if (!(await User.comparePasswords(password, user.password))) {
      return next(new AppError(400, "Invalid email or password"));
    }

    const { access_token, refresh_token } = await signTokens(user);

    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("refresh_token", refresh_token, refreshTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    return res.status(200).json({
      status: "success",
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    const message = "Could not refresh access token";

    if (!refresh_token) {
      return next(new AppError(403, message));
    }

    const decoded = verifyJwt<{ sub: string }>(
      refresh_token,
      "refreshTokenPublicKey"
    );

    if (!decoded) {
      return next(new AppError(403, message));
    }

    const session = await redisClient.get(decoded.sub);

    if (!session) {
      return next(new AppError(403, message));
    }

    const user = await findUserById(JSON.parse(session).id);

    if (!user) {
      return next(new AppError(403, message));
    }

    const access_token = signJwt({ sub: user.id }, "accessTokenPrivateKey", {
      expiresIn: `${config.get<number>("accessTokenExpiresIn")}m`,
    });

    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    return res.status(200).json({
      status: "success",
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

const logout = (res: Response) => {
  res.cookie("access_token", "", { maxAge: -1 });
  res.cookie("refresh_token", "", { maxAge: -1 });
  res.cookie("logged_in", "", { maxAge: -1 });
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;

    await redisClient.del(user.id);
    logout(res);

    return res.status(200).json({
      status: "success",
    });
  } catch (err: any) {
    next(err);
  }
};

export const verifyEmailHandler = async (
  req: Request<VerifyEmailInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const verificationCode = crypto
      .createHash("sha256")
      .update(req.params.verificationCode)
      .digest("hex");

    const user = await findUser({ verificationCode });

    if (!user) {
      return new AppError(404, "Verification link is invalid or expired");
    }

    if (user.verified) {
      return res.status(200).json({
        status: "success",
        message: "Email is already verified",
      });
    }

    user.verified = true;
    user.verificationCode = null;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (err: any) {
    next(err);
  }
};

export const forgotPasswordHandler = catchAsync(
  async (
    req: Request<{}, {}, ForgotPasswordInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { email } = req.body;

    const user = await userRepo.findOneBy({ email });
    if (!user) return next(new AppError(404, "No user found with that email"));

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await userRepo.save(user);

    const resetURL = `${config.get<string>(
      "origin"
    )}/auth/change-password?token=${resetToken}`;

    try {
      await new Email(user, resetURL).sendPasswordResetToken();
      res
        .status(200)
        .json({ status: "success", message: "Reset link sent to email" });
    } catch (err) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await userRepo.save(user);
      return next(new AppError(500, "Failed to send email"));
    }
  }
);

export const resetPasswordHandler = catchAsync(
  async (
    req: Request<{}, {}, ResetPasswordInput>,
    res: Response,
    next: NextFunction
  ) => {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userRepo.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    if (!user)
      return next(new AppError(400, "Token is invalid or has expired"));

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await userRepo.save(user);

    return res
      .status(200)
      .json({ status: "success", message: "Password reset successfully" });
  }
);
