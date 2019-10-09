import * as React from "react";
import { useState, useRef, FC, useEffect } from "react";

export type layoutProps = {
  title: string;
};

export const BaseLayout: FC<layoutProps> = (props: layoutProps) => {
  const { title } = props;
  return (
    <html>
      <head>
        <title>{title}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
        />

        <link rel="stylesheet" type="text/css" href="/index.css" />
      </head>
      <body>
        <h1>UNDER CONSTRUCTION</h1>
        <div id="root" />
        <script type="text/javascript" src="/dist/index.js" />
      </body>
    </html>
  );
};
