import { Points } from "../utils";

export const addPath = (canvas: SVGElement, point: Points): SVGPathElement => {
  const pathElm: SVGPathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  const initialPoint = `M ${Math.floor(point.x)} ${Math.floor(point.y)} `;
  pathElm.setAttribute("d", initialPoint);
  pathElm.setAttribute("fill", "none");
  pathElm.setAttribute("pointer-events", "none");
  pathElm.setAttribute("stroke-linecap", "round");
  pathElm.setAttribute("stroke-linejoin", "round");
  canvas.appendChild(pathElm);
  return pathElm;
};

export const updatePath = (path: SVGPathElement, point: Points) => {
  let pointsArray: string = path.getAttribute("d");
  const movement = ` L ${Math.floor(point.x)} ${Math.floor(point.y)}`;
  pointsArray += movement;
  path.setAttribute("d", pointsArray);
};

export const setPointerEventsEnableToAllPath = (canvas: SVGElement) => {
  const allPathList = Array.from(canvas.querySelectorAll("path"));
  allPathList.forEach(path => {
    path.setAttribute("pointer-events", "auto");
  });
};

export const setPointerEventsDisableToAllPath = (canvas: SVGElement) => {
  const allPathList = Array.from(canvas.querySelectorAll("path"));
  allPathList.forEach(path => {
    path.setAttribute("pointer-events", "none");
  });
};
