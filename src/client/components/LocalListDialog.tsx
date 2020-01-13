import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC } from "react";
import { HyperIllust } from "../../share/model";

type LocalListDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  userName: string;
  onSelected: (item: HyperIllust) => void;
  onDeleted: (item: HyperIllust) => void;
  localIllustList: HyperIllust[];
};

//シンプルなダイアログ用コンポーネント
export const LocalListDialog: FC<LocalListDialogProps> = props => {
  const {
    isShow,
    onCancel,
    onSelected,
    onDeleted,
    localIllustList,
    userName
  } = props;

  return ReactDOM.createPortal(
    <>
      {isShow && (
        <>
          <section className="overLay" onClick={onCancel}>
            <div className="localListContainer">
              <h2>今までに作成した図</h2>

              <div className="ImportModalMenuContainer">
                <div className="ImportModalMenu">
                  {localIllustList.map((item: HyperIllust, index: number) => {
                    return (
                      <>
                        <a
                          key={index}
                          className="linkedItemContainer"
                          href={`https://draw-wiki.herokuapp.com/${userName}/${
                            item.sourceKey
                          }`}
                          onClick={event => {
                            event.stopPropagation();
                          }}
                        >
                          <img
                            key={index}
                            className="linkedItem"
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
                            onDeleted(item);
                          }}
                        >
                          x
                        </div>
                      </>
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
