import * as express from "express";
import { renderToString } from "react-dom/server";
import * as React from "react";
import { app } from "../index";
import { BaseLayout } from "../../../views/layout";
export const hicRouter: express.Router = express.Router();

hicRouter.get("/", (req: express.Request, res: express.Response) => {
  //   res
  //     .header("content-type", "text/html")
  //     .send(renderToString(<BaseLayout title={"Hello"} />))
  //     .end();
  res.render("index");
});
