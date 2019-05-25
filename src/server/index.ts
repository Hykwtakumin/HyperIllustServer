import * as express from "express";
import * as cors from "cors";
import * as path from "path";
import * as multer from "multer";
import { configuredS3 } from "./aws";

const app = express();
app.listen(process.env.PORT || 3000);

app.use(cors());
console.log(__dirname);
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "/views"));
//app.set("view engine", "html");

app.get("/", (req, res) => {
  //res.json({ message: "hello!" });
  //res.render("index.html");
  console.log(path.resolve(__dirname, "./views/index.html"));
  res.sendFile(path.resolve(__dirname, "index.html"));
});

app.post("/upload/:hicId", (req, res) => {
  const hicId: string = req.params.hicId;
  const mime: string = "image/svg+xml";
  const body = req.body;
  console.dir({ hicId, mime, body });
  //configuredS3();
});
