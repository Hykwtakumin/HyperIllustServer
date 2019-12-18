import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC } from "react";
import { HyperIllust } from "../../share/model";

type ShareDialogProps = {
  isShow: boolean;
  itemKey: string;
  onCancel: () => void;
};

export const ShareDialog: FC<ShareDialogProps> = props => {
  const { isShow, onCancel, itemKey } = props;
  return ReactDOM.createPortal(
    <>
      {props.isShow && (
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
                  src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${itemKey}`}
                  draggable={false}
                />
              </div>

              <div
                style={{
                  width: "100%"
                }}
              />
            </div>
          </section>
        </>
      )}
    </>,
    document.body
  );
};
