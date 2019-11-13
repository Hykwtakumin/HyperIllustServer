import * as React from "react";
import { FC, useRef, useState } from "react";
import { useModal, ButtonComponent } from "./share";
import { PublishButtonProps } from "./PublishButton";
import { restoreFromLocalStorage } from "./share/localStorage";
import { HyperIllust } from "../../share/model";
import { logger } from "../../share/logger";

/*押すと他のハイパーイラストをインポートできるモーダルを召喚するボタン*/

/*サムネはURLを渡すだけ*/
/*なのでCORSをクリアしている必要がある*/

export type AddInnerLinkButtonProps = {
  onSelected: (itemId: string) => void;
  localIllustList: HyperIllust[];
};

export type SelectedItem = {
  selsectedId: string;
};

export const AddInnerLinkButton: FC<AddInnerLinkButtonProps> = (
  props: AddInnerLinkButtonProps
) => {
  const { showModal } = useModal();
  const debug = logger("client:ImportButton");

  const inner = (
    <div className="ImportModalMenuContainer">
      <div className="ImportModalMenu">
        {props.localIllustList.map((item: HyperIllust, index: number) => {
          return (
            <img
              key={index}
              className={"ImportModalItem"}
              alt={item.id}
              title={item.id}
              src={item.sourceURL}
              width={100}
              height={80}
              onClick={() => {
                handleImageSelect(item.id);
              }}
            />
          );
        })}
      </div>
    </div>
  );

  const handleImageSelect = (key: string) => {
    props.onSelected(key);
  };

  const popUpModal = () => {
    showModal({
      type: "confirm",
      title: <h2>{`他のイラストと紐付ける`}</h2>,
      content: (
        <>
          <div>
            <h3>{`以下のリストから選択`}</h3>
            {inner}
          </div>
        </>
      ),
      onCancel() {},
      cancelText: "キャンセル"
    });
  };

  return (
    <div style={{ padding: "3px" }}>
      <ButtonComponent type="default" onClick={popUpModal}>
        AddLink
      </ButtonComponent>
    </div>
  );
};