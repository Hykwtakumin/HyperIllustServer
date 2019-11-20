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
  | "transeform";

export type OpeStacks = {
  type: OpeType;
  desc: Object;
};
