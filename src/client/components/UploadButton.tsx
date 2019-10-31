import * as React from "react";
import { FC, useRef, useState } from "react";
import { useModal, ButtonComponent } from "./share";

export type UploadButtonProps = {
  onExport: () => void;
  selectedElms: SVGElement[];
};

/*個別要素ではなくキャンバス全体をアップロードする*/
export const UploadButton: FC<UploadButtonProps> = (
  props: UploadButtonProps
) => {
  const { showModal } = useModal();
  //const [title, setTitle] = useState<string>("");
  //const titleInput = useRef(null);

  //アップロードするものによって文言を変えても良い?
  //キャンバス全体 => キャンバスをアップロード
  //選択していた場合 => 選択範囲をアップロード

  const renderTitle = (): string => {
    if (props.selectedElms && props.selectedElms.length > 0) {
      return "選択した要素をアップロード";
    } else {
      return "キャンバスをアップロード";
    }
  };

  /*useModalではuseCallbackを使っているのでローカル変数がそのままでは使えない*/
  const handleSendTitle = () => {
    props.onExport();
  };

  const handleUpload = () => {};

  const showSuccessModal = () => {
    if (props) {
    }
  };

  const close = () => {};

  const popUpModal = () => {
    showModal({
      type: "confirm",
      title: <h3>{renderTitle()}</h3>,
      content: <></>,
      onOk() {
        props.onExport();
      },
      onCancel() {},
      okText: "アップロード",
      cancelText: "キャンセル"
    });
  };

  const successModal = () => {};

  return (
    <div style={{ padding: "3px" }}>
      <ButtonComponent type="default" onClick={popUpModal}>
        Upload
      </ButtonComponent>
    </div>
  );
};
