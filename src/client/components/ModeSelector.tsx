import * as React from "react";
import { FC } from "react";

type ModeSelectorProps = {
  text: string;
  modeChange: () => void;
};

/*そもそも編集モードとかはあまりよくないのではないか?*/
export const ModeSelector: FC<ModeSelectorProps> = (
  props: ModeSelectorProps
) => {
  return (
    <>
      <input type={"button"} value={props.text} onClick={props.modeChange} />
    </>
  );
};
