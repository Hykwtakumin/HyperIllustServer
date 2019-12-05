import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC } from "react";
import { ButtonComponent } from "./share";
import { HyperIllust } from "../../share/model";

type ThumbDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  sourceKey: string;
};

//シンプルなダイアログ用コンポーネント
export const ThumbDialog: FC<ThumbDialogProps> = props => {
  return ReactDOM.createPortal(
    <>
      {props.isShow && (
        <>
          <section className="overLay" onClick={props.onCancel}>
            <div
              style={{
                width: "50%",
                height: "50%",
                backgroundColor: "white",
                border: "none",
                boxShadow: "0px 5px 5px rgba(0,0,0,0.4)",
                position: "absolute"
              }}
            >
              <a
                href={`https://draw-wiki.herokuapp.com/${
                  props.sourceKey.split("_")[1]
                }/${props.sourceKey}`}
                target={"_blank"}
              >
                <img
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%"
                  }}
                  alt={props.sourceKey}
                  title={props.sourceKey}
                  src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${
                    props.sourceKey
                  }`}
                  draggable={false}
                />
              </a>
            </div>
          </section>
        </>
      )}
    </>,
    document.body
  );
};
