import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC } from "react";
import { ButtonComponent } from "./share";
import { HyperIllust } from "../../share/model";

type ImportDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  onSelected: (item: HyperIllust) => void;
  localIllustList: HyperIllust[];
};

//シンプルなダイアログ用コンポーネント
export const ImportDialog: FC<ImportDialogProps> = props => {
  return ReactDOM.createPortal(
    <>
      {props.isShow && (
        <>
          <section className="overLay" onClick={props.onCancel}>
            <div className="importDialogContainer">
              <h2>他のイラストと紐付けます</h2>

              <div className="ImportModalMenuContainer">
                <div className="ImportModalMenu">
                  {props.localIllustList.map(
                    (item: HyperIllust, index: number) => {
                      return (
                        <img
                          key={index}
                          className={"referedItem"}
                          alt={item.id}
                          title={item.id}
                          src={item.sourceURL}
                          width={200}
                          draggable={false}
                          onClick={() => {
                            props.onSelected(item);
                          }}
                        />
                      );
                    }
                  )}
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
