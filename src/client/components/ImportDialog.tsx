import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC, useEffect } from "react";
import { ButtonComponent } from "./share";
import { HyperIllust } from "../../share/model";
import {
  sortImagesByCreatedAtAscend,
  sortImagesByCreatedAtDescend
} from "./share/utils";
import * as day from "dayjs";
import * as moment from "moment";
import { useState } from "react";

type ImportDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  onSortModified: () => void;
  onSortNewer: () => void;
  onSortLinked: () => void;
  onSortLinkedBy: () => void;
  onSelected: (item: HyperIllust) => void;
  localIllustList: HyperIllust[];
};

//シンプルなダイアログ用コンポーネント
export const ImportDialog: FC<ImportDialogProps> = props => {
  const {
    isShow,
    onCancel,
    onSelected,
    localIllustList,
    onSortModified,
    onSortNewer,
    onSortLinked,
    onSortLinkedBy
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

  const handleSortModified = (event: React.PointerEvent<HTMLInputElement>) => {
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
            <div className="importDialogContainer">
              <div className="localListContainerControlPane">
                <h2>他のメモ・イラストをリンクさせます</h2>
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
                    onClick={handleSortModified}
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
                      <div key={`c-${item.id}`} className="linkedItemContainer">
                        <img
                          key={item.id}
                          className="linkedItem"
                          alt={item.id}
                          title={item.id}
                          src={item.sourceURL}
                          width={200}
                          draggable={false}
                          onClick={() => {
                            onSelected(item);
                          }}
                        />
                      </div>
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
