import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC, useState, useEffect } from "react";
import { ButtonComponent } from "./share";
import { HyperIllust } from "../../share/model";
import { Group } from "./share/utils";

type ViewLinkDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  linkedKeys: string[];
  linkedByKes: string[];
  selfKey: string;
  onKeySelected: (key: string) => void;
};

//ここのソートもいじれるようにする?(今じゃなくても良い)

//シンプルなダイアログ用コンポーネント
export const ViewLinkDialog: FC<ViewLinkDialogProps> = props => {
  return ReactDOM.createPortal(
    <>
      <>
        <div className="viewLinkDialogContainer">
          <h3 style={{ userSelect: "none" }}>関連する図</h3>
          <div className="linkedItemMenu">
            {props.linkedKeys
              .filter(item => item !== props.selfKey)
              .map((item: string, index: number) => {
                // const sourceKey = item.split("/")[4];
                return (
                  <div key={index} className="linkedItemContainer">
                    <img
                      key={index}
                      className="linkedItem"
                      alt={item}
                      title={item}
                      src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${item}.svg`}
                      width={200}
                      draggable={false}
                      onClick={() => {
                        props.onKeySelected(item);
                      }}
                    />
                  </div>
                );
              })}
          </div>
          <div className="linkedByItemMenu">
            {props.linkedByKes
              .filter(item => item !== props.selfKey)
              .map((item: string, index: number) => {
                // const sourceKey = item.split("/")[4];
                return (
                  <div key={index} className="linkedItemContainer">
                    <img
                      key={index}
                      className="linkedItem"
                      alt={item}
                      title={item}
                      src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${item}.svg`}
                      width={200}
                      draggable={false}
                      onClick={() => {
                        props.onKeySelected(item);
                      }}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </>
    </>,
    document.body
  );
};
