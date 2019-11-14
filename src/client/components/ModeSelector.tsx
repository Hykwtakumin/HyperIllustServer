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
      <ButtonComponent type={"default"} onClick={props.modeChange}>
        {props.text}
      </ButtonComponent>
    </div>
  );
};
