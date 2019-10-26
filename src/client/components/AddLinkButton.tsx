import * as React from "react";
import { FC, useRef, useState } from "react";
import { useModal, ButtonComponent } from "./share";

export type AddLinkButtonProps = {
  onAddLink: (linkedURL: string) => void;
  selectedElms: SVGElement[];
};

export const AddLinkButton: FC<AddLinkButtonProps> = (
  props: AddLinkButtonProps
) => {
  const { showModal } = useModal();
  const linkInput = useRef<HTMLInputElement>(null);

  const sendLink = () => {
    props.onAddLink(linkInput.current.value);
  };

  const setAbility = (): boolean => {
    return !props.selectedElms || props.selectedElms.length <= 0;
  };

  const popUpModal = () => {
    showModal({
      type: "confirm",
      title: <h3>{`リンクを埋め込む`}</h3>,
      content: (
        <div style={{ textAlign: "center" }}>
          <input
            ref={linkInput}
            type={"text"}
            style={{ fontSize: "16pt", width: "80%" }}
          />
        </div>
      ),
      onOk() {
        sendLink();
      },
      onCancel() {},
      okText: "リンクの追加",
      cancelText: "キャンセル"
    });
  };

  return (
    <div style={{ padding: "3px" }}>
      <ButtonComponent
        type="default"
        onClick={popUpModal}
        disabled={setAbility()}
      >
        AddLink
      </ButtonComponent>
    </div>
  );
};
