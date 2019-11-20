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
console.dir(hydratedSVG);
const elements: Element[] | SVGElement[] = Array.from(
  hydratedSVG.children[0].children
);

const svg: Element | SVGElement = elements[0];
const desc = svg;
console.dir(desc);

const desilializedStroke = JSON.parse(svg.getAttribute("stroke-data"));
const desilializedGroup = JSON.parse(svg.getAttribute("group-data"));

console.log("stroke");
console.dir(desilializedStroke);
console.log("group");
console.dir(desilializedGroup);

elements.forEach((item: Element | SVGElement, index: number) => {
  if (item.nodeName == "path") {
    console.log(`it is PathElement : ${item}`);
  }
});

render(
  <ModalProvider>
    <MainCanvas
      loadedStrokes={desilializedStroke}
      loadedGroups={desilializedGroup}
    />
  </ModalProvider>,
  rootElement
);
