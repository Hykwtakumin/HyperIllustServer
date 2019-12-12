import * as React from "react";
import { render } from "react-dom";
import { MainCanvas } from "./components/MainCanvas";
import { ModalProvider } from "./components/share";

const rootElement = document.getElementById("root");

const serializedHydratedSVG: string = document
  .getElementById("hydration-data")
  .getAttribute("data-data");
const domParser = new DOMParser();
const hydratedSVG = domParser.parseFromString(
  serializedHydratedSVG,
  "image/svg+xml"
);
const elements: Element[] | SVGElement[] = Array.from(
  hydratedSVG.children[0].children
);

const svg: Element | SVGElement = elements[0];
const desc = svg;

const desilializedStroke = JSON.parse(svg.getAttribute("stroke-data"));
const desilializedGroup = JSON.parse(svg.getAttribute("group-data"));
const desilializedReferred = JSON.parse(svg.getAttribute("referred-data"));
const desilializedRefer = JSON.parse(svg.getAttribute("refer-data"));
const desilializedImported = JSON.parse(svg.getAttribute("imported-data"));
const desilializedImport = JSON.parse(svg.getAttribute("import-data"));

console.log("stroke");
console.dir(desilializedStroke);
console.log("group");
console.dir(desilializedGroup);

console.log("desilializedReferred");
console.dir(desilializedReferred);

render(
  <ModalProvider>
    <MainCanvas
      loadedStrokes={desilializedStroke}
      loadedGroups={desilializedGroup}
      loadedReferred={desilializedReferred}
      loadedRefer={desilializedRefer}
      loadedImported={desilializedImported}
      loadedImport={desilializedImport}
    />
  </ModalProvider>,
  rootElement
);
