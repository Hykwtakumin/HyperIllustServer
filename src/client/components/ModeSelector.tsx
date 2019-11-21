import * as React from "react";
import { FC } from "react";
import { ButtonComponent } from "./share";

type ModeSelectorProps = {
  text: string;
  modeChange: () => void;
};

/*そもそも編集モードとかはあまりよくないのではないか?*/
export const ModeSelector: FC<ModeSelectorProps> = (
  props: ModeSelectorProps
) => {
  return (
    <div style={{ padding: "3px" }}>
      <ButtonComponent
        type={props.text === "draw" ? "orange" : "primary"}
        onClick={props.modeChange}
      >
        {props.text === "draw" ? (
          <img
            src={"../icons/brush-24px.svg"}
            alt={"描画モード"}
            title={"描画モード"}
            draggable={false}
            style={{ transform: "scale(1.5)" }}
          />
        ) : (
          <img
            src={"../icons/crop-24px.svg"}
            alt={"編集モード"}
            title={"編集モード"}
            draggable={false}
            style={{ transform: "scale(1.5)" }}
          />
        )}
      </ButtonComponent>
    </div>
  );
};
