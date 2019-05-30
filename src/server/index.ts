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
import { hicRouter } from "./routes/hic";
import { apiRouter } from "./routes/api";

export const app: express.Express = express();
const server: Server = createServer(app);
//app.listen(process.env.PORT || 3000);
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "../../public")));
app.set("views", path.join(__dirname, "../../views"));
app.set("view engine", "tsx");
app.engine("tsx", reactViews.createEngine());

server.listen(port, () => {
  console.log(`server listeninig at port : ${port}`);
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cookieParser());

//app.use("/api/", apiRouter);
app.use("/", hicRouter);
