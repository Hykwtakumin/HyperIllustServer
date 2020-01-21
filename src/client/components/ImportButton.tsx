import * as React from "react";
import { FC, useRef, useState } from "react";
import { useModal, ButtonComponent } from "./share";
import { PublishButtonProps } from "./PublishButton";
import { restoreFromLocalStorage } from "./share/localStorage";
import { HyperIllust, HyperIllustUser } from "../../share/model";
import { logger } from "../../share/logger";
import { getUser, loadMetaData } from "./share/API";
import { loadUserInfo } from "./share/UserSetting";

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

//localHyperIllustを全て削除する
export function resetLocalIllusts() {
  if (localStorage) {
    for (let key in localStorage) {
      if (key && key.includes("hyperillust")) {
        localStorage.removeItem(key);
      }
    }
  }
}

//ユーザーメタデータに紐付いているものを全部取得して、それをローカルリストに代入する
export function loadIllustsFromUser(userName: string): Array<HyperIllust> {
  const localHyperIllusts: HyperIllust[] = [];

  getUser(userName).then(result => {
    if (result && result.illustList && result.illustList.length > 0) {
      result.illustList.forEach(async (item, index) => {
        if (item && item !== null) {
          const loaded = await loadMetaData(item);
          if (loaded) {
            localHyperIllusts.push(loaded);
          }
        }
      });
    }
  });

  return localHyperIllusts;
}

export const ImportButton: FC<ImportButtonProps> = (
  props: ImportButtonProps
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
                handleImageSelect(item.sourceKey);
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
      <ButtonComponent type="green" onClick={popUpModal}>
        <img
          src={"../icons/cloud_download-24px.svg"}
          alt={"インポート"}
          title={"インポート"}
          draggable={false}
          style={{ transform: "scale(1.5)" }}
        />
      </ButtonComponent>
    </div>
  );
};
