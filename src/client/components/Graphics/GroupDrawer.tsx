import * as React from "react";
import { FC } from "react";
import { StrokeDrawer } from "./StrokeDrawer";
import { PointerEvents, Stroke } from "../share/utils";

//グループ化について
export type Group = {
  id: string;
  href: string;
  strokes: Stroke[];
  style: string;
  transform: string;
};

export type GroupDrawerProps = {
  groupElms: Group[];
  events: PointerEvents;
};

//グループ化した要素をまとめて扱うコンポーネント
//リンクをホバーしたりクリックしたら情報を表示する?
export const GroupDrawer: FC<GroupDrawerProps> = props => {
  const handleLinkHover = (href: string) => {
    console.log(`次のリンクが設定されています:${href}`);
  };

  return (
    <>
      {props.groupElms.map((group, index) => {
        return (
          <a id={group.id} key={index} href={group.href} target={"blank"}>
            <g transform={group.transform} pointerEvents={props.events}>
              <StrokeDrawer strokes={group.strokes} events={props.events} />
            </g>
          </a>
        );
      })}
    </>
  );
};