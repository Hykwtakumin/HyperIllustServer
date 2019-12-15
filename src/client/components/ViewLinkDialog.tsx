import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC, useState, useEffect } from "react";
import { ButtonComponent } from "./share";
import { HyperIllust } from "../../share/model";
import { Group } from "./share/utils";

type ViewLinkDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  referedIllusts: string[];
  selfKey: string;
  onKeySelected: (key: string) => void;
};

type illustReferences = {
  key: string;
  referes: string[];
};

//シンプルなダイアログ用コンポーネント
export const ViewLinkDialog: FC<ViewLinkDialogProps> = props => {
  return ReactDOM.createPortal(
    <>
      <>
        <div className="viewLinkDialogContainer">
          <h3>関連する図</h3>
          <div className="referedItemMenu">
            {props.referedIllusts.filter(item => item !== props.selfKey).map((item: string, index: number) => {
              const sourceKey = item.split("/")[4];
              return (
                <div key={index} className="referedItemContainer">
                  <img
                    key={index}
                    className="referedItem"
                    alt={item}
                    title={item}
                    src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${sourceKey}`}
                    width={200}
                    draggable={false}
                    onClick={() => {
                      props.onKeySelected(sourceKey);
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
