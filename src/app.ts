require("dotenv").config();

import express, { NextFunction, Request, Response } from "express";
import config from "config";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import categoryRoutes from "./routes/category.routes";
import { AppDataSource } from "./utils/data-source.util";
import validateEnv from "./utils/validate-env.util";
import redisClient from "./utils/connect-redis.util";
import AppError from "./utils/app-error.util";
import { setupSwaggerDocs } from "./utils/swagger.util";

AppDataSource.initialize()
  .then(async () => {
    validateEnv();

    const app = express();

    // TEMPLATE ENGINE

    // MIDDLEWARE

    app.use(express.json({ limit: "10kb" }));

    if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

    app.use(cookieParser());

    app.use(
      cors({
        origin: config.get<string>("origin"),
        credentials: true,
      })
    );

    app.use("/api/auth", authRouter);
    app.use("/api/users", userRouter);
    app.use("/api/categories", categoryRoutes);

    app.get("/api/healthChecker", async (_, res: Response) => {
      const message = await redisClient.get("try");

      res.status(200).json({
        status: "success",
        message,
      });
    });

    const port = config.get<number>("port");

    setupSwaggerDocs(app, port);

    app.all("*", (req: Request, res: Response, next: NextFunction) => {
      next(new AppError(404, `Route ${req.originalUrl} not found`));
    });

    app.use(
      (error: AppError, req: Request, res: Response, next: NextFunction) => {
        error.status = error.status || "error";
        error.statusCode = error.statusCode || 500;

        res.status(error.statusCode).json({
          status: error.status,
          message: error.message,
        });
      }
    );

    app.listen(port, () => {
      console.log(`🚀 Server started on port: ${port}`);
    });
  })
  .catch((error) => console.log(error));

// require("dotenv").config();

// import cluster from "cluster";
// import os from "os";
// import express, { NextFunction, Request, Response } from "express";
// import config from "config";
// import morgan from "morgan";
// import cookieParser from "cookie-parser";
// import helmet from "helmet";
// import cors from "cors";

// import authRouter from "./routes/auth.routes";
// import userRouter from "./routes/user.routes";
// import { AppDataSource } from "./utils/data-source.util";
// import validateEnv from "./utils/validate-env.util";
// import redisClient from "./utils/connect-redis.util";
// import AppError from "./utils/app-error.util";
// import { setupSwaggerDocs } from "./utils/swagger.util";

// // get number of CPU cores
// const numCPUs = os.cpus().length;

// if (cluster.isPrimary) {
//   console.log(`🧠 Primary process ${process.pid} is running`);

//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker, code, signal) => {
//     console.warn(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
//     cluster.fork();
//   });
// } else {
//   AppDataSource.initialize()
//     .then(async () => {
//       validateEnv();

//       const app = express();

//       // TEMPLATE ENGINE (preserved for future)

//       // middleware
//       app.use(express.json({ limit: "10kb" }));

//       if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//       app.use(helmet());
//       app.use(cookieParser());

//       app.use(
//         cors({
//           origin: config.get<string>("origin"),
//           credentials: true,
//         })
//       );

//       // routes
//       app.use("/api/auth", authRouter);
//       app.use("/api/users", userRouter);

//       app.get("/api/healthChecker", async (_, res: Response) => {
//         const message = await redisClient.get("try");

//         res.status(200).json({
//           status: "success",
//           message,
//         });
//       });

//       const port = config.get<number>("port");

//       // swagger
//       setupSwaggerDocs(app, port);

//       // 404 Handler
//       app.all("*", (req: Request, res: Response, next: NextFunction) => {
//         next(new AppError(404, `Route ${req.originalUrl} not found`));
//       });

//       // global error handler
//       app.use(
//         (error: AppError, req: Request, res: Response, next: NextFunction) => {
//           error.status = error.status || "error";
//           error.statusCode = error.statusCode || 500;

//           res.status(error.statusCode).json({
//             status: error.status,
//             message: error.message,
//           });
//         }
//       );

//       const server = app.listen(port, () => {
//         console.log(`🚀 Worker ${process.pid} started on port: ${port}`);
//       });

//       // graceful shutdown handlers
//       process.on("SIGTERM", () => {
//         console.log("SIGTERM received. Shutting down gracefully.");
//         server.close(() => {
//           console.log("Closed out remaining connections.");
//           process.exit(0);
//         });
//       });

//       process.on("SIGINT", () => {
//         console.log("SIGINT received. Shutting down gracefully.");
//         server.close(() => {
//           console.log("Closed out remaining connections.");
//           process.exit(0);
//         });
//       });
//     })
//     .catch((error) => {
//       console.error("❌ App initialization failed:", error);
//       process.exit(1);
//     });
// }
