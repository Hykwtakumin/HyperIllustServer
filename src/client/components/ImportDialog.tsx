import * as React from "react";
import * as ReactDOM from "react-dom";
import {FC, useEffect} from "react";
import { ButtonComponent } from "./share";
import { HyperIllust } from "../../share/model";
import {sortImagesByCreatedAtAscend, sortImagesByCreatedAtDescend} from "./share/utils";
import * as day from "dayjs";
import * as moment from 'moment';

type ImportDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  onSelected: (item: HyperIllust) => void;
  localIllustList: HyperIllust[];
};

//シンプルなダイアログ用コンポーネント
export const ImportDialog: FC<ImportDialogProps> = props => {
  const { isShow, onCancel, onSelected, localIllustList } = props;
  // //localIllustList.map(item => console.dir(new Date(item.createdAt)));
  // // console.dir(day());
  // console.dir(day().format());
  // console.dir(day());
  //localIllustList.map(item => console.dir(moment(item.createdAt, "YYYY-MM-DD-HH-mm-ss").toDate()));

  useEffect(() => {
    const lists = localIllustList;
    console.dir(sortImagesByCreatedAtAscend(lists).map(item => item.createdAt));
    console.dir(sortImagesByCreatedAtDescend(lists).map(item => item.createdAt));
  }, []);

  return ReactDOM.createPortal(
    <>
      {isShow && (
        <>
          <section className="overLay" onClick={onCancel}>
            <div className="importDialogContainer">
              <h2>他のイラストと紐付けます</h2>

              <div className="ImportModalMenuContainer">
                <div className="ImportModalMenu">
                  {sortImagesByCreatedAtAscend(localIllustList).map(
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
                            onSelected(item);
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
