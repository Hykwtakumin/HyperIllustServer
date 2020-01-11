import { DateLike, HyperIllust } from "../../../share/model";
import * as day from "dayjs";
import * as moment from "moment";

export type Points = {
  x: number;
  y: number;
};

export const getPoint = (
  pageX: number,
  pageY: number,
  targetDomRect: SVGElement
): Points => {
  let x, y;
  let rect = targetDomRect.getBoundingClientRect();
  let dx = rect.left + window.pageXOffset;
  let dy = rect.top + window.pageYOffset;
  x = pageX - dx;
  y = pageY - dy;
  return { x, y };
};

//独自形式からDateに変換する

export const dateConverter = (createdAt: DateLike): Date => {
  return moment(createdAt, "YYYY-MM-DD-HH-mm-ss").toDate();
};

//古い順にソート
export const sortImagesByCreatedAtAscend = (
  list: HyperIllust[]
): HyperIllust[] => {
  return list.sort((a, b) => {
    return dateConverter(a.createdAt) > dateConverter(b.createdAt) ? 1 : -1;
  });
};

//新しい順にソート
export const sortImagesByCreatedAtDescend = (
  list: HyperIllust[]
): HyperIllust[] => {
  return list.sort((a, b) => {
    return dateConverter(a.createdAt) < dateConverter(b.createdAt) ? 1 : -1;
  });
};

//日毎に分割する

//月ごとに分割する

export type titleImageMap = {
  title: string;
  image: string;
};

export type EditorMode = "draw" | "edit";

export type PointerEvents = "none" | "auto";

export type drawPoint = {
  x: number;
  y: number;
};

export type Stroke = {
  id: string;
  points: drawPoint[];
  color: string;
  width: string;
  isSelected: boolean;
};

export type Size = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type Group = {
  id: string;
  href: string;
  strokes: Stroke[];
  style?: string;
  transform?: string;
};

export type OpeType =
  | "draw"
  | "remove"
  | "import"
  | "delete"
  | "move"
  | "transform";

export type OpeStacks = {
  type: OpeType;
  desc: Object;
};

export type DrawPreset = "normal" | "bold" | "shadow" | "highLight";
