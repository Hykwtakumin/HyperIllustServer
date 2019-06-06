import * as express from "express";
import { renderToString } from "react-dom/server";
import * as React from "react";
import { app } from "../index";
import { BaseLayout } from "../../../views/layout";
import {
  uploadFile,
  promiseUpload,
  putFile,
  asyncReadFile,
  asyncUnLink
} from "../services/s3";
import * as fetchBase64 from "fetch-base64";
import * as multer from "multer";
import * as path from "path";
import * as AWS from "aws-sdk";
import * as dotenv from "dotenv";
import * as moment from "moment";
import * as fs from "fs";
import { promisify } from "util";
export const Router: express.Router = express.Router();

const uploader = multer({ dest: "tmp/" });

Router.get("/", (req: express.Request, res: express.Response) => {
  res
    .header("content-type", "text/html")
    .send(renderToString(<BaseLayout title={"Hello"} />))
    .end();
});

Router.get("/proxy/:url", (req: express.Request, res: express.Response) => {
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

Router.post(
  "/api/upload",
  uploader.single("file"),
  async (req: express.Request, res: express.Response) => {
    const now = moment().format("YYYY-MM-DD-HH-mm-ss");
    const fileName = `hyperillust_${now}_.svg`;
    const mime: string = "image/svg+xml";

    console.dir(req.file);
    const rawData = await asyncReadFile(req.file.path);

    try {
      const result = await uploadFile(fileName, rawData, mime);
      const url = result.Location;
      asyncUnLink(req.file.path);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(
        JSON.stringify({
          ok: true,
          url: url
        })
      );
    } catch (e) {
      res.send(e);
    }
  }
);
