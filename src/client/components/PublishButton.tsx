import * as React from "react";
import { FC } from "react";
import { useModal, ButtonComponent } from "./share";

export type PublishButtonProps = {
  onUpload: () => any;
};
/*押すとキャンバスや選択範囲をネット上に公開するモーダルを召喚するボタン*/
/**/
export const PublishButton: FC<PublishButtonProps> = (
  props: PublishButtonProps
) => {
  const { showModal } = useModal();

  const popUpModal = () => {
    showModal({
      type: "confirm",
      title: <h2>{`選択したPathを公開します`}</h2>,
      content: (
        <>
          <div>
            <h3>{`アップロード`}</h3>
          </div>
        </>
      ),
      onOk() {
        props.onUpload();
      },
      onCancel() {},
      okText: "アップロード",
      cancelText: "キャンセル"
    });
  };

  return (
    <>
      <ButtonComponent type="primary" onClick={popUpModal}>
        Publish
      </ButtonComponent>
    </>
  );
};
