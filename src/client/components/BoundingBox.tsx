import * as React from "react";
import { useState, useRef, useEffect } from "react";

export interface BondingBoxProps {
  left: number;
  top: number;
  width: number;
  height: number;
  visible: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onResized: () => void;
  onRotated: () => void;
  onRemoved: () => void;
  onCopied: () => void;
  onPublished: () => void;
  onAddLink: () => void;
}

/*選択した範囲のSVG要素を弄ったりリンクつけたりするComponent*/
/*SVGの要素として最初から制御用SVGレイヤーにマウントする?*/
/*というか制御用SVGレイヤーごと返す*/
export const BoundingBox = (props: BondingBoxProps) => {
  const BBLayer = useRef<SVGSVGElement>(null);

  const setVisibility = (): string => {
    if (props.visible) {
      return "block";
    } else {
      return "none";
    }
  };

  // useEffect(() => {
  //   console.log(`Top: ${props.top}, Left: ${props.left}, Width: ${props.width}, Height: ${props.height}`);
  // }, [props]);

  //召喚したBoundingBoxを
  //ドラッグする => 移動(transform?)
  //回転ハンドルを操作 => 回転
  //隅っこをドラッグ => 拡大・縮小(縦横比を保持)
  //上下左右をドラッグ => 拡大・縮小(縦横比を保持しない)
  //

  const handleAddLink = () => {
    //ポータルでダイアログを出す
    alert("このパスを公開します");
  };

  /**/
  return (
    <div style={{ position: "absolute", display: setVisibility() }}>
      <svg
        ref={BBLayer}
        className="BBLayer"
        viewBox={`0 0 ${props.canvasWidth} ${props.canvasHeight}`}
        width={props.canvasWidth}
        height={props.canvasHeight}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <rect
          id={"BBRect"}
          x={props.left}
          y={props.top}
          width={props.width}
          height={props.height}
          fill="#01bc8c"
          fillOpacity="0.25"
        />
      </svg>
    </div>
  );
};

//        <rect x={props.left} y={props.height}
//               width={100} height={50} fill="gray"
//               onClick={handleAddLink}
//         >Publish</rect>
