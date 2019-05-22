import * as express from "express";
import { ErrorRequestHandler, Express } from "express";
import { Server } from "http";
import * as helmet from "helmet";
import { hicRoutes } from "./routes/routes";
import * as bodyParser from "body-parser";
import { DocumentNotFoundError } from "./db/errors";
import * as AWS from "aws-sdk";
import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";

// import {
//   OverdueError,
//   ParameterTypeError,
//   PermissionDeniedError
// } from "./errors";

import { MongoError } from "mongodb";
import { apiRoutes } from "./routes/api";
import * as cookieParser from "cookie-parser";

export function wrap<T>(asyncf: (req, res, next) => Promise<T>) {
  return (req, res, next) => asyncf(req, res, next).catch(next);
}

// const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
//   error(err);
//   let status = 500;
//   switch (err.constructor) {
//     case SyntaxError:
//     case ParameterTypeError:
//     case OverdueError:
//     case MongoError:
//       status = 400;
//       break;
//     case PermissionDeniedError:
//       status = 403;
//       break;
//     case DocumentNotFoundError:
//       status = 404;
//       break;
//     default:
//       return next(err);
//   }

//   res.status(status).json({ error: err.name, message: err.message });
// };

const app = express();

const upload = multer({ dest: path.resolve("./public/tmp") });

export const upload2s3 = async (hicId: string, file: any): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(file.path, (err, data) => {
      if (err) throw err;
    });
  });
};

app.post("/upload/:hicId", upload.single("file"), (req, res) => {
  const hicId: string = req.params.hicId;
  const mime = req.file.mimetype || "image/svg+xml";
});
