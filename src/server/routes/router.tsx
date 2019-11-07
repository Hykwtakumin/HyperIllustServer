import * as express from "express";
import { renderToString } from "react-dom/server";
import * as React from "react";
import { app } from "../index";
import { BaseLayout } from "../../../views/BaseLayout";
import {
  asyncReadFile,
  asyncUnLink,
  promiseGetFile,
  promisePutFile
} from "../services/s3";
import * as fetchBase64 from "fetch-base64";
import * as multer from "multer";
import * as path from "path";
import * as AWS from "aws-sdk";
import * as dotenv from "dotenv";
import * as moment from "moment";
import * as fs from "fs";
import { promisify } from "util";
const shortid = require("shortid");
import * as socketIo from "socket.io";
import { publishUpdate } from "../services/socket";
import {
  createHyperIllust,
  getHyperIllust,
  getUser,
  getUsersIllusts
} from "../HyperIllusts";
import { HyperIllust, HyperIllustUser } from "../../share/model";
import * as fetch from "node-fetch";
import { logger } from "../../share/logger";
const { debug } = logger("router:index");

export const Router = (io: socketIo.Server): express.Router => {
  const router = express.Router();

  const multerStorage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, "tmp/");
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });

  //const uploader = multer({ dest: "tmp/" });
  const uploader = multer({ storage: multerStorage });

  /*新規ユーザーの場合はランダムなidをつけて返す?*/
  router.get("/", (req: express.Request, res: express.Response) => {
    res.redirect(`/${shortid.generate().toString()}`);
  });

  /*TopページにGetでアクセスするとエディタのJSXを返す*/
  router.get(
    "/:userName",
    async (req: express.Request, res: express.Response) => {
      res
        .header("content-type", "text/html")
        .send(renderToString(<BaseLayout title={"DrawWiki"} />))
        .end();
    }
  );

  //ユーザーが持っている画像一覧取得
  router.get(
    "/user/:userName",
    async (req: express.Request, res: express.Response) => {
      res.send(JSON.stringify(await getUsersIllusts(req.params.userName)));
    }
  );

  //イラストidを拡張子付で指定された場合はS3のURLを直に返す?
  //これで表示できるんだろうか?
  router.get(
    "/illust/:illustId.svg",
    async (req: express.Request, res: express.Response) => {
      const illust = await getHyperIllust(req.params.illustId);
      res.send(JSON.stringify(illust.sourceURL));
    }
  );

  //イラストidを単に指定された場合はHyperIllustを返す
  router.get(
    "/illust/:illustId",
    async (req: express.Request, res: express.Response) => {
      res.send(JSON.stringify(await getHyperIllust(req.params.illustId)));
    }
  );

  /*TODO 外部ラスターイメージの読み込みは後でちゃんと作り直す*/
  /*ローカルの画像をDnDで読み込む分にはこれは使わなくて良い*/
  router.get(
    "/api/proxy/:url",
    (req: express.Request, res: express.Response) => {
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
    }
  );

  /*他のハイパーイラストをimportする*/
  router.get(
    "/api/import/:url",
    async (req: express.Request, res: express.Response) => {
      const imageKey = decodeURIComponent(req.params.url);
      debug(`imageKey: ${imageKey}`);
      try {
        const result = await fetch(
          `https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${imageKey}`
        );
        const svg = await result.text();
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(svg);
      } catch (error) {
        debug(error);
        res.send(error);
      }
    }
  );

  /*アップロード用API*/
  /*MultiPartでSVGを受け取る*/
  /*File名はClientで生成する方が良い?*/
  /*アップロードが終了したらS3のURLではなくリソースIDを返す*/
  router.post(
    "/api/upload/:userName",
    uploader.single("file"),
    async (req: express.Request, res: express.Response) => {
      const now = moment().format("YYYY-MM-DD-HH-mm-ss");
      const fileName = `hyperillust_${req.params.userName}_${now}_.svg`;
      const mime: string = "image/svg+xml";

      const rawData = await asyncReadFile(req.file.path);

      try {
        const result = await promisePutFile(fileName, rawData, mime);
        debug(result);
        //アップロードしたらS3のリンクとKeyを控えておく
        const svgURL = result.Location;
        const svgKey = result.Key;

        //アップロード時にClientはユーザー情報も上げるものとする

        //HyperIllustのデータを作成
        const newIllust: HyperIllust = {
          id: fileName,
          sourceKey: svgKey,
          sourceURL: svgURL,
          name: fileName,
          desc: "",
          size: req.file.size,
          owner: req.params.userName,
          isForked: false,
          origin: "",
          version: 1,
          createdAt: now,
          updatedAt: now
        };
        //サーバー側は何もせずにただClientにHyperIllustを返すだけ!簡単

        //アップロードしたらローカルの一時ファイルは削除
        await asyncUnLink(req.file.path);

        //CORSを全許可にして返す?
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(JSON.stringify(newIllust));
      } catch (e) {
        res.send(e);
      }
    }
  );

  //リソース
  router.get(
    "/api/:hicId",
    async (req: express.Request, res: express.Response) => {
      //
    }
  );

  router.post(
    "/api/postlayer",
    uploader.single("file"),
    async (req: express.Request, res: express.Response) => {
      const rawData = await asyncReadFile(req.file.path);
      res.send({ layerPath: req.file.filename });
      publishUpdate("scrapbox", req.file.filename, io);
    }
  );

  router.get(
    "/api/getlayer/:name",
    async (req: express.Request, res: express.Response) => {
      const rawData = await asyncReadFile(`tmp/${req.params.name}`);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "image/svg+xml");
      res.send(rawData);
    }
  );

  return router;
};
