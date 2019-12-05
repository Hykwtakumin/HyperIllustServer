import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC } from "react";
import { ButtonComponent } from "./share";
import { HyperIllust } from "../../share/model";

type ViewLinkDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  referedIllusts: string[];
};

//シンプルなダイアログ用コンポーネント
export const ViewLinkDialog: FC<ViewLinkDialogProps> = props => {
  return ReactDOM.createPortal(
    <>
      {props.isShow && (
        <>
          <section className="overLay" onClick={props.onCancel}>
            <div
              style={{
                width: "80%",
                height: "80%",
                backgroundColor: "white",
                border: "none",
                boxShadow: "0px 5px 5px rgba(0,0,0,0.4)",
                position: "absolute"
              }}
            >
              <h2>以下のイラストがリンクによって紐付いています</h2>

              <div className="ImportModalMenuContainer">
                <div className="ImportModalMenu">
                  {props.referedIllusts.map((item: string, index: number) => {
                    const sourceKey = item.split("/")[4];
                    return (
                      <a href={item} target={"_blank"}>
                        <img
                          key={index}
                          className={"ImportModalItem"}
                          alt={item}
                          title={item}
                          src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${sourceKey}`}
                          width={200}
                          draggable={false}
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>,
    document.body
  );
};
