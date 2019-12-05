import * as React from "react";
import { FC, useState } from "react";
import { StrokeDrawer } from "./StrokeDrawer";
import { Group, PointerEvents } from "../share/utils";

export type GroupDrawerProps = {
  groupElms: Group[];
  events: PointerEvents;
  selectedGroup: Group;
  onGroupSelected: (group: Group) => void;
};

//グループ化した要素をまとめて扱うコンポーネント
//リンクをホバーしたりクリックしたら情報を表示する?
//こういう処理はMainCanvasでやった方が良いか?
export const GroupDrawer: FC<GroupDrawerProps> = props => {
  //選択されたGroupはすべてのPathの表示をかえる
  const handleLinkHover = (event: React.SyntheticEvent, group: Group) => {
    event.preventDefault();
    console.dir(`次のリンクが設定されています:${group}`);
    //親に渡す
    props.onGroupSelected(group);
    //alert(`次のリンクが設定されています:${group.href}`);
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
              handleLinkHover(event, group);
            }}
          >
            {props.selectedGroup && group.id === props.selectedGroup.id ? (
              <g transform={group.transform} pointerEvents={props.events}>
                <StrokeDrawer
                  strokes={group.strokes}
                  events={props.events}
                  style={"activePath"}
                />
              </g>
            ) : (
              <g transform={group.transform} pointerEvents={props.events}>
                <StrokeDrawer
                  strokes={group.strokes}
                  events={props.events}
                  style={""}
                />
              </g>
            )}
          </a>
        );
      })}
    </>
  );
};
