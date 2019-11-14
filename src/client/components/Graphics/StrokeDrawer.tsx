import * as React from "react";
import { FC } from "react";
import { drawPoint, PointerEvents, Stroke } from "../share/utils";

export type StrokeDrawerProps = {
  strokes: Stroke[];
  events: PointerEvents;
  style?: string;
};

//描かれたPathをまとめて管理するComponent
export const StrokeDrawer: FC<StrokeDrawerProps> = props => {
  return (
    <>
      {props.strokes.map((stroke, index) => {
        const initialPoint: drawPoint = stroke.points[0] || { x: 0, y: 0 };

        const LineToPoints = stroke.points.map((point, index) => {
          if (index > 0) {
            return `L ${point.x} ${point.y} `;
          }
        });

        const style = (): string => {
          if (stroke.isSelected) {
            return "red";
          } else {
            return "#585858";
          }
        };

        return (
          <path
            strokeLinejoin={"round"}
            strokeLinecap={"round"}
            stroke={style()}
            strokeWidth={"6"}
            className={props.style || ""}
            pointerEvents={props.events}
            fill={"rgba(0,0,0,0)"}
            id={stroke.id}
            key={index}
            d={`M ${initialPoint.x} ${initialPoint.y} ${LineToPoints}`}
          />
        );
      })}
      <path />
    </>
  );
};
