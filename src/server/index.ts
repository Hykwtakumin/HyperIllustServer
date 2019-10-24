import * as express from "express";
import { createServer, Server } from "http";
import * as cors from "cors";
import * as path from "path";
import * as dotenv from "dotenv";
import * as multer from "multer";
import { configuredS3 } from "./aws";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as reactViews from "express-react-views";
import { Router } from "./routes/router";
import { apiRouter } from "./routes/api";
import { createSocketIOServer, socketIOHandler } from "./services/socket";
import { mongoDbSetup } from "./services/db";
import { logger } from "../share/logger";
const { debug } = logger("index:index");

export const app: express.Express = express();
const server: Server = createServer(app);
const port = process.env.PORT || 3000;

const io = createSocketIOServer(server);
socketIOHandler(io);

mongoDbSetup()
  .then(() => {
    app.use(cors());
    app.set("trust proxy", true);
    app.use(express.static("public"));
    app.set("views", "views");

    app.set("view engine", "tsx");
    app.engine("tsx", reactViews.createEngine());

    server.listen(port, () => {
      console.log(`server listening at port : ${port}`);
    });

    app.use(bodyParser.json());
    app.use(
      bodyParser.urlencoded({
        extended: true
      })
    );
    app.use(cookieParser());

    //app.use("/api/", apiRouter);
    app.use("/", Router(io));
  })
  .catch(e => {
    debug(e);
    process.exit(1);
  });
