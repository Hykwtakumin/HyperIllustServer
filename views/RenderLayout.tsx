import * as React from "react";
import { FC } from "react";
import {Group, PointerEvents, Stroke} from "../src/client/components/share/utils";
import {StrokeDrawer} from "../src/client/components/Graphics/StrokeDrawer";
import {GroupDrawer} from "../src/client/components/Graphics/GroupDrawer";

type RenderLayoutProps = {
  width: number;
  height: number
  strokeList: Stroke[];
  groupList: Group[];
  events?: PointerEvents;
}

export const RenderLayout:FC<RenderLayoutProps> = props => {
  const { width,height, strokeList, groupList, events } = props;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <StrokeDrawer strokes={strokeList} events={events} />
      <GroupDrawer groupElms={groupList} events={events} />
    </svg>
  );
};
