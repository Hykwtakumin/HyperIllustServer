import { logger } from "../share/logger";
import * as dotenv from "dotenv";
dotenv.config();

import { readFileSync } from "fs";
const { error } = logger("service:env");

let {
  NODE_ENV,
  HIC_MONGODB_HOST,
  HIC_MONGODB_PORT,
  HIC_MONGODB_ENDPOINT,
  HIC_PORT
} = process.env;

HIC_PORT = HIC_PORT || "9000";
HIC_MONGODB_HOST = HIC_MONGODB_HOST || "localhost";
HIC_MONGODB_PORT = HIC_MONGODB_PORT || "27017";
NODE_ENV = NODE_ENV || "development";
process.env["NODE_ENV"] = NODE_ENV;

export const mongoDBHost = HIC_MONGODB_HOST;
export const mongoDBPort = HIC_MONGODB_PORT;
export const mongoDBEndpoint = HIC_MONGODB_ENDPOINT;
export const port = HIC_PORT;
export const nodeEnv = NODE_ENV;
