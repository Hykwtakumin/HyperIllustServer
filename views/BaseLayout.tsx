import * as React from "react";
import { FC } from "react";

export type layoutProps = {
  title: string;
  hydratedSVG?: SVGElement;
};

export const BaseLayout: FC<layoutProps> = (props: layoutProps) => {
  const { title, hydratedSVG } = props;
  return (
    <html>
      <head>
        <title>{title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
        />

        <link rel="favicon" sizes="64x64" href="/icons/favicon.ico" />
        <link rel="stylesheet" type="text/css" href="/index.css" />
      </head>
      <body>
        <div id="root" />
        <div id="hydration-data" style={{display: "none"}} data-data={hydratedSVG} >
        </div>
        <script type="text/javascript" src="/dist/index.js" />
      </body>
    </html>
  );
};
