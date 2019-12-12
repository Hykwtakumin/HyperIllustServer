import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC } from "react";
import { ButtonComponent } from "./share";
import { HyperIllust } from "../../share/model";

type LocalListDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  onSelected: (item: HyperIllust) => void;
  onDeleted: (item: HyperIllust) => void;
  localIllustList: HyperIllust[];
};

//シンプルなダイアログ用コンポーネント
export const LocalListDialog: FC<LocalListDialogProps> = props => {
  return ReactDOM.createPortal(
    <>
      {props.isShow && (
        <>
          <section className="overLay" onClick={props.onCancel}>
            <div className="localListContainer">
              <h2>今までに作成した図</h2>

              <div className="ImportModalMenuContainer">
                <div className="ImportModalMenu">
                  {props.localIllustList.map(
                    (item: HyperIllust, index: number) => {
                      return (
                        <>
                          <a
                            key={index}
                            className="referedItemContainer"
                            href={`https://draw-wiki.herokuapp.com/${
                              item.sourceKey.split("_")[1]
                            }/${item.sourceKey}`}
                            onClick={event => {
                              event.stopPropagation();
                            }}
                            target={"_blank"}
                          >
                            <img
                              key={index}
                              className={"referedItem"}
                              alt={item.id}
                              title={item.id}
                              src={item.sourceURL}
                              width={200}
                              draggable={false}
                              onClick={() => {
                                //props.onSelected(item);
                                // event.stopPropagation();
                                // event.preventDefault();
                              }}
                            />
                          </a>
                          <div
                            key={`x-${index}`}
                            onClick={event => {
                              event.stopPropagation();
                              event.preventDefault();
                              props.onDeleted(item);
                            }}
                          >
                            x
                          </div>
                        </>
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
