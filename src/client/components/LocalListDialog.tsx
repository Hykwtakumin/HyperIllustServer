import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC, useEffect, useState } from "react";
import { HyperIllust } from "../../share/model";
import {
  sortImageByLinked,
  sortImageByLinkedBy,
  sortImagesByCreatedAtAscend,
  sortImagesByCreatedAtDescend
} from "./share/utils";

type LocalListDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  onSortModified: () => void;
  onSortNewer: () => void;
  onSortLinked: () => void;
  onSortLinkedBy: () => void;
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
    onSortModified,
    onSortNewer,
    onSortLinked,
    onSortLinkedBy,
    onDeleted,
    localIllustList,
    userName
  } = props;

  const handleSortLinked = (event: React.PointerEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onCancel();
    onSortLinked();
  };

  const handleSortLinkedBy = (event: React.PointerEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onCancel();
    onSortLinkedBy();
  };

  const handleModified = (event: React.PointerEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onCancel();
    onSortModified();
  };

  const handleNewer = (event: React.PointerEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onCancel();
    onSortNewer();
  };

  return ReactDOM.createPortal(
    <>
      {isShow && (
        <>
          <section className="overLay" onClick={onCancel}>
            <div className="localListContainer">
              <div className="localListContainerControlPane">
                <h2>今までに作成したメモ・イラスト</h2>
                <div className="sortButtonContainer">
                  <input
                    type="button"
                    value="作成日順"
                    className="sortButton"
                    onClick={handleNewer}
                  />
                  <input
                    type="button"
                    value="更新日時順"
                    className="sortButton"
                    onClick={handleModified}
                  />
                  <input
                    type="button"
                    value="引用数順"
                    className="sortButton"
                    onClick={handleSortLinked}
                  />
                  <input
                    type="button"
                    value="被引用数順"
                    className="sortButton"
                    onClick={handleSortLinkedBy}
                  />
                </div>
              </div>

              <div className="ImportModalMenuContainer">
                <div className="ImportModalMenu">
                  {localIllustList.map((item: HyperIllust, index: number) => {
                    return (
                      <>
                        <a
                          key={item.id}
                          className="linkedItemContainer"
                          href={`/${userName}/${item.id}`}
                          onClick={event => {
                            event.stopPropagation();
                          }}
                        >
                          <img
                            // key={item.id}
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
                          key={`x-${item.id}`}
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
