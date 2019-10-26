import * as React from "react";
import { FC, useRef, useState } from "react";
import { useModal, ButtonComponent } from "./share";
import { PublishButtonProps } from "./PublishButton";
import { restoreFromLocalStorage } from "./share/localStorage";
import { HyperIllust } from "../../share/model";
import {logger} from "../../share/logger";

/*押すと他のハイパーイラストをインポートできるモーダルを召喚するボタン*/

/*サムネはURLを渡すだけ*/
/*なのでCORSをクリアしている必要がある*/

export type ImportButtonProps = {
  onSelected: (itemId: string) => void;
  localIllustList: HyperIllust[];
};

export type SelectedItem = {
  selsectedId: string;
};

//localに保存されているhyperIllustを全件取得する
export function loadHyperIllusts(): Array<HyperIllust> {
  const localHyperIllusts: HyperIllust[] = [];
  if (localStorage) {
    for (let key in localStorage) {
      if (key && key.includes("hyperillust")) {
        const restored = JSON.parse(localStorage.getItem(key)) as HyperIllust;
        localHyperIllusts.push(restored);
      }
    }
  }
  return localHyperIllusts;
}

export const ImportButton: FC<ImportButtonProps> = (
  props: ImportButtonProps
) => {
  const { showModal } = useModal();
  const debug = logger("client:ImportButton");

  const inner = (
    <div className="ImportModalMenu" >
      {props.localIllustList.map((item: HyperIllust, index: number) => {
        return (        <img
          key={index}
          className="ImportModalItem"
          alt={item.id}
          title={item.id}
          src={item.sourceURL}
          width={100}
          height={80}
          onClick={() => {
            handleImageSelect(item.id);
          }}
        />)
      })}
    </div>
  );

  const handleImageSelect = (key: string) => {
    props.onSelected(key);
  };

  const popUpModal = () => {
    showModal({
      type: "confirm",
      title: <h2>{`他のイラストをキャンバスに追加`}</h2>,
      content: (
        <>
          <div>
            <h3>{`以下のリストからインポート`}</h3>
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
        Import
      </ButtonComponent>
    </div>
  );
};
