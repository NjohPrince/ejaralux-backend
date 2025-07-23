import "reflect-metadata";

require("dotenv").config();

import { DataSource } from "typeorm";
import config from "config";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";


const postgresConfig = config.get<{
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}>("postgresConfig");

export const AppDataSource = new DataSource({
  ...postgresConfig,
  type: "postgres",
  synchronize: true,
  logging: false,
  entities: ["src/entities/**/*.entity{.ts,.js}"],
  migrations: ["src/migrations/**/*{.ts,.js}"],
  subscribers: ["src/subscribers/**/*{.ts,.js}"],
  namingStrategy: new SnakeNamingStrategy(),
});
