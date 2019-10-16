import * as React from "react";
import { FC } from "react";
import { useModal, ButtonComponent } from "./share";
import { PublishButtonProps } from "./PublishButton";

/*押すと他のハイパーイラストをインポートできるモーダルを召喚するボタン*/

/*サムネはURLを渡すだけ*/
/*なのでCORSをクリアしている必要がある*/

export type HyperIllust = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
};

export type ImportButtonProps = {
  onSelected: (resourceURL: string) => void;
};

export const ImportButton: FC<ImportButtonProps> = (
  props: ImportButtonProps
) => {
  const { showModal } = useModal();

  const popUpModal = () => {
    showModal({
      type: "confirm",
      title: <h2>{`他のイラストをキャンバスに追加`}</h2>,
      content: (
        <>
          <div>
            <h3>{`インポート`}</h3>
          </div>
        </>
      ),
      onOk() {
        props.onSelected("");
      },
      onCancel() {},
      okText: "追加する",
      cancelText: "キャンセル"
    });
  };

  return (
    <>
      <ButtonComponent type="primary" onClick={popUpModal}>
        Import
      </ButtonComponent>
    </>
  );
};
