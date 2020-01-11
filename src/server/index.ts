import * as express from "express";
import { ErrorRequestHandler } from "express";
import { createServer, Server } from "http";
import * as cors from "cors";
import * as path from "path";
import { configuredS3 } from "./aws";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as reactViews from "express-react-views";
import { Router } from "./routes/router";
import { createSocketIOServer, socketIOHandler } from "./services/socket";
import { logger } from "../share/logger";
import { Simulate } from "react-dom/test-utils";
import { setUpClient } from "./services/db";
const { debug } = logger("index:index");

export const app: express.Express = express();
const server: Server = createServer(app);
const port = process.env.PORT || 3000;

const io = createSocketIOServer(server);
socketIOHandler(io);

app.use(cors());
app.set("trust proxy", true);
app.use(express.static("public"));
app.set("views", "views");

app.set("view engine", "tsx");
app.engine("tsx", reactViews.createEngine());

export const wrap = <T>(asyncf: (req, res, next) => Promise<T>) => (
  req,
  res,
  next
) => asyncf(req, res, next).catch(next);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  debug(`error: ${err}`);
  let status = 500;
  return next(err);
  res.status(status).json({ error: err.name, message: err.message });
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

server.listen(port, () => {
  debug(`server listening at port : ${port}`);
});

app.use("/", Router(io));
app.use(errorHandler);
