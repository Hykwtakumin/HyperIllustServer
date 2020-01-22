import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC, useRef } from "react";
import { HyperIllust } from "../../share/model";
import { ButtonComponent } from "./share";
import { Simulate } from "react-dom/test-utils";

type ShareDialogProps = {
  isShow: boolean;
  itemKey: string;
  onCancel: () => void;
};

export const ShareDialog: FC<ShareDialogProps> = props => {
  const { isShow, onCancel, itemKey } = props;

  const handleCopy = (event: React.MouseEvent<HTMLElement>) => {
    //copyToClipboard(`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${itemKey}.svg`);
    alert("URLをコピーしました!");
    onCancel();
  };

  return ReactDOM.createPortal(
    <>
      {isShow && (
        <>
          <section className="overLay" onClick={props.onCancel}>
            <div
              className="shareDialogContainer"
              onClick={event => {
                event.stopPropagation();
              }}
            >
              <h2>この図を共有します</h2>

              <div
                style={{
                  maxWidth: "100%",
                  maxHeight: "80%"
                }}
              >
                <img
                  style={{
                    maxWidth: "100%",
                    maxHeight: "50%"
                  }}
                  alt={itemKey}
                  title={itemKey}
                  src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${itemKey}.svg`}
                  draggable={false}
                />

                <div
                  style={{
                    margin: "5px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center"
                  }}
                >
                  <ButtonComponent type={"primary"} onClick={handleCopy}>
                    画像リンクをコピー
                  </ButtonComponent>
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
