import * as React from "react";
import { FC } from "react";
import { drawPoint } from "../share/utils";

export type PathDrawerProps = {
  points: drawPoint[];
  color: string;
  width: string;
};

//リアルタイム描画用Component
export const PathDrawer: FC<PathDrawerProps> = props => {
  const initialPoint: drawPoint = props.points[0] || { x: 0, y: 0 };

  const LineToPoints = props.points.map((point, index) => {
    if (index > 0) {
      return `L ${point.x} ${point.y} `;
    }
  });

  return (
    <path
      id={"strokeDrawer"}
      strokeLinejoin={"round"}
      strokeLinecap={"round"}
      stroke={props.color}
      strokeWidth={props.width}
      pointerEvents={"none"}
      fill={"rgba(0,0,0,0)"}
      d={`M ${initialPoint.x} ${initialPoint.y} ${LineToPoints}`}
    />
  );
};
