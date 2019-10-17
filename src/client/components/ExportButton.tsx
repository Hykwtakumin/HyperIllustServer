import * as React from "react";
import { FC, useRef, useState } from "react";
import { useModal, ButtonComponent } from "./share";

export type ExportButtonProps = {
  onExport: (title: string) => void;
};

/*スクボに新しいページを作る*/

export const ExportButton: FC<ExportButtonProps> = (
  props: ExportButtonProps
) => {
  const { showModal } = useModal();
  const [title, setTitle] = useState<string>("");
  const titleInput = useRef(null);

  /*useModalではuseCallbackを使っているのでローカル変数がそのままでは使えない*/
  /*古い値が返ってくる問題*/
  /*なのでrefを使ったりしてなんとか乗り切る*/
  const handelSendTitle = () => {
    props.onExport(titleInput.current.value);
  };

  const popUpModal = () => {
    showModal({
      type: "confirm",
      title: <h2>{`新規ページを作成します`}</h2>,
      content: (
        <>
          <div>
            <h3>{`以下のタイトルのページを作成`}</h3>
            <input ref={titleInput} type={"text"} />
          </div>
        </>
      ),
      onOk() {
        handelSendTitle();
      },
      onCancel() {},
      okText: "新規作成",
      cancelText: "キャンセル"
    });
  };

  return (
    <div style={{ padding: "3px" }}>
      <ButtonComponent type="default" onClick={popUpModal}>
        Export
      </ButtonComponent>
    </div>
  );
};
