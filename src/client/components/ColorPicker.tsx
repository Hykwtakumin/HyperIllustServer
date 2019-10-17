import * as React from "react";

interface ColorPickerProps {
  colorChange: (e: React.SyntheticEvent<HTMLInputElement>) => void;
}

/*ペンの太さを変更するコンポーネント*/
/* TODO SVGにした方が良いかも,selectはかっこよくない */
/*押すとペンの太さを選べるツールチップを表示するボタン*/
/*現在の太さも表示する*/
export const ColorPicker = (props: ColorPickerProps) => {
  const { colorChange } = props;
  return (
    <React.Fragment>
      <input
        type={"color"}
        defaultValue={"#585858"}
        className={"button toolButton"}
        onChange={colorChange}
      />
    </React.Fragment>
  );
};
