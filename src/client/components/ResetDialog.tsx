import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC } from "react";
import { ButtonComponent } from "./share";

type ResetDialogProps = {
  isShow: boolean;
  message?: string;
  okText?: string;
  onOk: () => void;
  onCancel?: () => void;
};

//シンプルなダイアログ用コンポーネント
export const ResetDialog: FC<ResetDialogProps> = props => {
  return ReactDOM.createPortal(
    <>
      {props.isShow && (
        <>
          <section className="overLay" onClick={props.onCancel}>
            <div
              style={{
                width: "40%",
                height: "30%",
                backgroundColor: "white",
                border: "none",
                position: "absolute"
              }}
            >
              <h2>描いたものをリセットします</h2>

              <ButtonComponent type="default" onClick={props.onCancel}>
                {"キャンセル"}
              </ButtonComponent>
              <ButtonComponent type="danger" onClick={props.onOk}>
                {props.okText || "OK"}
              </ButtonComponent>
            </div>
          </section>
        </>
      )}
    </>,
    document.body
  );
};
