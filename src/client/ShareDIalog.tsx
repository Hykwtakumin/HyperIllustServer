import * as React from "react";
import * as ReactDOM from "react-dom";
import {FC, ReactNode, useEffect} from "react";
import * as QRCode from 'qrcode'
import {useState} from "react";
import {ButtonComponent} from "./components/share";

type ShareDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  resourceKey: string;
  resourceURL: string;
};

const qrOption = {
  type: 'svg'
};

export const ShareDialog: FC<ShareDialogProps> = props => {

  const qrCode = (): Element => {
    let code;
    const domParser = new DOMParser();

    QRCode.toString(props.resourceURL, qrOption, (err, result) => {
      if (err) {
        code = <>Error</>
      }
      code = <>ここにQRコードが表示される</>
      // code = <>{domParser.parseFromString(
      //   result,
      //   "image/svg+xml"
      // )}</>
    });

    return code;
  };

  return ReactDOM.createPortal(
    <>
      { props.isShow &&
      <section className="overLay" onClick={props.onCancel}>
          <div
              style={{
                width: "40%",
                height: "30%",
                backgroundColor: "white",
                border: "none",
                boxShadow: "0px 5px 5px rgba(0,0,0,0.4)",
                position: "absolute"
              }}
          >
              <h2>このイラストを共有します。</h2>
              <div style={{
                margin: "20%"
              }}>
                {qrCode()}
              </div>
          </div>
      </section>
      }
    </>
    , document.body);
};
