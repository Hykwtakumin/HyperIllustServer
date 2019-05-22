import * as express from "express";
import { configuredS3 } from "./aws";

const app = express();
app.listen(process.env.PORT || 3000);

app.get("/", (req, res) => {
  res.json({ message: "hello!" });
});

app.post("/upload/:hicId", (req, res) => {
  const hicId: string = req.params.hicId;
  const mime: string = "image/svg+xml";
  configuredS3();
});
