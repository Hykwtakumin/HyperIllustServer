import * as React from "react";
import { FC } from "react";
import { StrokeDrawer } from "./StrokeDrawer";
import { Group, PointerEvents } from "../share/utils";

export type GroupDrawerProps = {
  groupElms: Group[];
  events: PointerEvents;
};

//グループ化した要素をまとめて扱うコンポーネント
//リンクをホバーしたりクリックしたら情報を表示する?
export const GroupDrawer: FC<GroupDrawerProps> = props => {
  const handleLinkHover = (event: React.SyntheticEvent, href: string) => {
    event.preventDefault();
    console.log(`次のリンクが設定されています:${href}`);
    alert(`次のリンクが設定されています:${href}`);
  };

  return (
    <>
      {props.groupElms.map((group, index) => {
        return (
          <a
            id={group.id}
            key={index}
            href={group.href}
            target={"blank"}
            onClick={event => {
              handleLinkHover(event, group.href);
            }}
          >
            <g transform={group.transform} pointerEvents={props.events}>
              <StrokeDrawer
                strokes={group.strokes}
                events={props.events}
                style={"linkedPath"}
              />
            </g>
          </a>
        );
      })}
    </>
  );
};
