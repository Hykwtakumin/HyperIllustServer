import * as express from "express";
import { renderToString } from "react-dom/server";
import * as React from "react";
import { app, wrap } from "../index";
import { BaseLayout } from "../../../views/BaseLayout";
import {
  asyncReadFile,
  asyncUnLink,
  promiseDeleteFile,
  promiseGetFile,
  promisePutFile
} from "../services/s3";
import * as fetchBase64 from "fetch-base64";
import * as multer from "multer";
import * as path from "path";
import * as AWS from "aws-sdk";
import * as dotenv from "dotenv";
import * as day from "dayjs";
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
import { RenderLayout } from "../../../views/RenderLayout";
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

  /*Topページにリソース付きでアクセスするとeditとセットで返す*/
  router.get(
    "/:userName/:fileKey",
    async (req: express.Request, res: express.Response) => {
      //
      const username = decodeURIComponent(req.params.userName);
      const imageKey = decodeURIComponent(req.params.fileKey);
      debug(`imageKey: ${imageKey}`);

      const result = await fetch(
        `https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${imageKey}`,
        {
          method: "GET",
          mode: "cors"
        }
      );

      //これはBufferで返ってくる
      //const result = await promiseGetFile(imageKey);
      const svg = await result.text();

      if (result) {
        res
          .header("content-type", "text/html")
          .send(
            renderToString(<BaseLayout title={"DrawWiki"} hydratedSVG={svg} />)
          )
          .end();
      } else {
        res.redirect(`/${username}`);
      }
    }
  );

  //ユーザーが持っている画像一覧取得
  router.get(
    "/user/:userName",
    async (req: express.Request, res: express.Response) => {
      res.send(JSON.stringify(await getUsersIllusts(req.params.userName)));
    }
  );

  // //イラストidを拡張子付で指定された場合はS3のURLを直に返す?
  // //これで表示できるんだろうか?
  // router.get(
  //   "/illust/:illustId.svg",
  //   async (req: express.Request, res: express.Response) => {
  //     const illust = await getHyperIllust(req.params.illustId);
  //     res.send(JSON.stringify(illust.sourceURL));
  //   }
  // );

  //HyperIllustのkeyを単に指定された場合はHyperIllustの素のSVGを返す
  router.get(
    "/api/illust/:illustKey",
    async (req: express.Request, res: express.Response) => {
      const key = req.params.illustKey;

      const result = await fetch(
        `https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${key}`,
        {
          method: "GET",
          mode: "cors"
        }
      );

      if (result) {
        const svg = await result.text();
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(svg);
      } else {
        res.send("failed to get SVG.");
      }

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
      const now = day().format();
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
          referredIllusts: [],
          referIllusts: [],
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

  //同一keyのドキュメントを更新するAPI
  router.put(
    "/api/update/:key",
    uploader.single("file"),
    async (req: express.Request, res: express.Response) => {
      try {
        const mime: string = "image/svg+xml";
        const rawData = await asyncReadFile(req.file.path);
        const fileName = req.params.key;
        const result = await promisePutFile(fileName, rawData, mime);
        //アップロードしたらローカルの一時ファイルは削除
        await asyncUnLink(req.file.path);
        //CORSを全許可にして返す?
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(JSON.stringify(result.Key));
      } catch (error) {
        console.log(error);
        res.send(error);
      }
    }
  );

  //同一Keyのドキュメントを削除するAPI
  router.delete(
    "/api/delete/:key",
    async (req: express.Request, res: express.Response) => {
      const fileName = encodeURI(req.params.key);
      const result = await promiseDeleteFile(fileName);
      if (result) {
        res.send(JSON.stringify(result));
        console.log(`result ${fileName}`);
        console.dir(await result);
      } else {
        console.log(`something went wrong`);
        res.send("failed to delete");
      }
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

  //StrokeとGroupを受け取ってSSRしてみる試み
  router.post(
    "/api/ssr",
    wrap(async (req: express.Request, res: express.Response) => {
      const { width, height, stroke, group } = req.body;
      debug(`width: ${width}`);
      debug(`height: ${height}`);
      debug(`strokes: ${stroke.length}`);
      debug(`groups: ${group.length}`);

      const rendered = renderToString(
        <RenderLayout
          width={width}
          height={height}
          strokeList={stroke}
          groupList={group}
        />
      );

      if (rendered) {
        res
          .header("Content-Type", "image/svg+xml")
          .send(
            renderToString(
              <RenderLayout
                width={width}
                height={height}
                strokeList={stroke}
                groupList={group}
              />
            )
          )
          .end();
      } else {
        res.send({ status: "error" });
      }
    })
  );

  return router;
};
