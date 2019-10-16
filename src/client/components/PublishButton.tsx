import * as React from "react";
import { FC } from "react";
import { useModal, ButtonComponent } from "./share";

export type PublishButtonProps = {
  onUpload: () => any;
}

export const PublishButton: FC<PublishButtonProps> = (props: PublishButtonProps) => {

  const { showModal } = useModal();

  const popUpModal = () => {
    console.log("show modal");
    showModal({
      type: "confirm",
      title: <h2>{`この内容でアップロードします`}</h2>,
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
      <ButtonComponent elevate type="primary" onClick={popUpModal}>
        Publish
      </ButtonComponent>
    </>
  );
};


