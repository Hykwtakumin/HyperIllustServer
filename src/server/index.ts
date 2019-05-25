import * as express from "express";
import * as cors from "cors";
import * as multer from "multer";
import { configuredS3 } from "./aws";

const app = express();
app.listen(process.env.PORT || 3000);

app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "hello!" });
});

app.post("/upload/:hicId", (req, res) => {
  const hicId: string = req.params.hicId;
  const mime: string = "image/svg+xml";
  const body = req.body;
  console.dir({ hicId, mime, body });
  //configuredS3();
});
