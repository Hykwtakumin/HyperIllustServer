import * as express from "express";
import { renderToString } from "react-dom/server";
import * as React from "react";
import { app } from "../index";
import { BaseLayout } from "../../../views/layout";
import { uploadFile, promiseUpload } from "../services/s3";
import * as fetchBase64 from "fetch-base64";
import * as multer from "multer";
import * as path from "path";
export const hicRouter: express.Router = express.Router();

hicRouter.get("/", (req: express.Request, res: express.Response) => {
  res
    .header("content-type", "text/html")
    .send(renderToString(<BaseLayout title={"Hello"} />))
    .end();
});

hicRouter.get("/proxy/:url", (req: express.Request, res: express.Response) => {
  const imageURL = decodeURIComponent(req.params.url);
  fetchBase64
    .remote(imageURL)
    .then(data => {
      res.send({ data: data[1] });
    })
    .catch(error => {
      res.send(error);
      throw error;
    });
});

const upload = multer({ dest: path.resolve("./public/tmp") });
hicRouter.post(
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
