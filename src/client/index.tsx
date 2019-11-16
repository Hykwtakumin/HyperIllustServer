import * as React from "react";
import { render } from "react-dom";
import { MainCanvas } from "./components/MainCanvas";

const rootElement = document.getElementById("root");

const serializedHydratedSVG: string = document
  .getElementById("hydration-data")
  .getAttribute("data-data");
const domParser = new DOMParser();
const hydratedSVG = domParser.parseFromString(
  serializedHydratedSVG,
  "image/svg+xml"
);
console.dir(hydratedSVG);
const elements: Element[] | SVGElement[] = Array.from(
  hydratedSVG.children[0].children
);

const strokes = [];
const groups = [];

elements.forEach((item: Element | SVGElement, index: number) => {
  if (item.nodeName == "path") {
    console.log(`it is PathElement : ${item}`);
  }
});

render(<MainCanvas />, rootElement);
