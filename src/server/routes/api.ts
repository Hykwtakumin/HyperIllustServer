import * as express from "express";
import * as multer from "multer";
import * as path from "path";
import { uploadFile, promiseUpload } from "../services/s3";
import * as fetch from "node-fetch";
import * as fetchBase64 from "fetch-base64";

export const apiRouter: express.Router = express.Router();
const upload = multer({ dest: path.resolve("./public/tmp") });
console.log(`tmp path : ${path.resolve("./public/tmp")}`);

apiRouter.get("/:hicId", (req: express.Request, res: express.Response) => {
  const fileId: string = req.params.hicId;
  const mime: string = "image/svg+xml";
});

apiRouter.delete("/:hicId", (req: express.Request, res: express.Response) => {
  const fileId: string = req.params.hicId;
  const mime: string = "image/svg+xml";
});

apiRouter.post(
  "/upload/:hicId",
  upload.single("file"),
  (req: express.Request, res: express.Response) => {
    const hicId: string = req.params.hicId;
    const mime: string = "image/svg+xml";

    promiseUpload(hicId, req.file, mime)
      .then(data => {
        //
        res.send({ hicURL: data.location });
      })
      .catch(error => {
        res.send(error);
        throw error;
      });
  }
);
