import { MainCanvasProps } from "../MainCanvas";
import { Group, Stroke } from "./utils";
//keyを渡すとSVGをダウンロードしてパースして中のデータを渡してくれる関数
//メインスレッドで走らせると厳しそうなので?webWorkerの使用も検討する

export const parseSVGFromURL = async (
  key: string
): Promise<MainCanvasProps> => {
  const request = await fetch(`/api/illust/${key}`);
  const loadedSVG = await request.text();

  return await parseSVGFromString(loadedSVG);
};

export const parseSVGFromString = async (
  rawXML: string
): Promise<MainCanvasProps> => {
  const parsedSVG = new DOMParser().parseFromString(rawXML, "image/svg+xml");

  const elements: Element[] | SVGElement[] = Array.from(
    parsedSVG.children[0].children
  );

  const svg: Element | SVGElement = elements[0];

  const desilializedStroke = JSON.parse(svg.getAttribute("stroke-data"));
  const desilializedGroup = JSON.parse(svg.getAttribute("group-data"));
  const desilializedReferred = JSON.parse(svg.getAttribute("referred-data"));
  const desilializedRefer = JSON.parse(svg.getAttribute("refer-data"));
  const desilializedImported = JSON.parse(svg.getAttribute("imported-data"));
  const desilializedImport = JSON.parse(svg.getAttribute("import-data"));

  return {
    loadedStrokes: desilializedStroke,
    loadedGroups: desilializedGroup,
    loadedReferred: desilializedReferred,
    loadedRefer: desilializedRefer,
    loadedImported: desilializedImported,
    loadedImport: desilializedImport
  };
};
