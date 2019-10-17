import * as React from "react";
import { FC, useState, useRef, useEffect } from "react";
import { getPoint, Points } from "./utils";
import { PublishButton } from "./PublishButton";

export type BBSize = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export interface BondingBoxProps {
  visible: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onResized: (bbSize: BBSize) => void;
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
  const BBRect = useRef<SVGRectElement>(null);
  const CLayer = useRef<HTMLDivElement>(null);

  const [bbLeft, setBBLeft] = useState<number>(0);
  const [bbTop, setBBTop] = useState<number>(0);
  const [bbWidth, setBBWidth] = useState<number>(0);
  const [bbHeight, setBBHeight] = useState<number>(0);

  const setVisibility = (): string => {
    if (props.visible) {
      return "block";
    } else {
      return "none";
    }
  };
  let isDragging: boolean = false;

  /*BoundingBoxが作られたか否か*/
  /*イベントリスナの管理に使う?*/
  const [created, setCreated] = useState<boolean>(false);

  //召喚したBoundingBoxを
  //ドラッグする => 移動(transform?)
  //回転ハンドルを操作 => 回転
  //隅っこをドラッグ => 拡大・縮小(縦横比を保持)
  //上下左右をドラッグ => 拡大・縮小(縦横比を保持しない)
  //

  useEffect(() => {
    /*BBレイヤーが可視化されている場合のみイベントハンドラをAttachする*/
    /*それ以外はイベントハンドラはremoveしておく*/
    const ControlLayer: HTMLElement = document.getElementById("ControlLayer");
    if (props.visible) {
      AttachEventListeners(ControlLayer);
    } else {
      DetachEventListeners(ControlLayer);
    }
  }, [props.visible]);

  const handleAddLink = () => {
    //ポータルでダイアログを出す
    alert("このパスを公開します");
  };

  const AttachEventListeners = (element: HTMLElement) => {
    element.addEventListener(`pointerdown`, handleDown);
    element.addEventListener(`pointermove`, handleMove);
    element.addEventListener(`pointerup`, handleUp);
    element.addEventListener(`pointercancel`, handleCancel);
  };

  const DetachEventListeners = (element: HTMLElement) => {
    element.removeEventListener(`pointerdown`, handleDown);
    element.removeEventListener(`pointermove`, handleMove);
    element.removeEventListener(`pointerup`, handleUp);
    element.removeEventListener(`pointercancel`, handleCancel);
  };

  const handleDown = (event: PointerEvent) => {
    isDragging = true;

    /*編集モードの場合はバウンディングボックスを召喚する*/
    const canvas = BBLayer.current;
    const point: Points = getPoint(event.pageX, event.pageY, canvas);

    /*既にバウンディングボックスがある場合は*/
    /*BB自体もしくは制御部品に関するクリックはスルー*/
    if (bbLeft !== 0 && bbTop !== 0) {
      //もっと上手い方法がある気がする
      setBBLeft(0);
      setBBTop(0);
      setBBWidth(0);
      setBBHeight(0);

      setBBLeft(point.x);
      setBBTop(point.y);
    } else {
      setBBLeft(point.x);
      setBBTop(point.y);
    }
  };

  const handleMove = (event: PointerEvent) => {
    if (isDragging) {
      /*編集モードの場合はバウンディングボックスのサイズを調整する*/
      const canvas = BBLayer.current;
      const point: Points = getPoint(event.pageX, event.pageY, canvas);
      setBBWidth(point.x - bbLeft);
      setBBHeight(point.y - bbHeight);
    }
  };

  const handleUp = (event: PointerEvent) => {
    isDragging = false;
    /*編集モードの場合はバウンディングボックスのサイズを調整する*/
    const canvas = BBLayer.current;
    const point: Points = getPoint(event.pageX, event.pageY, canvas);
    setBBWidth(point.x - bbLeft);
    setBBHeight(point.y - bbHeight);

    /*イベントリスナーを外す*/
    DetachEventListeners(CLayer.current);

    /*キャンバスにBB情報を返す*/
    props.onResized({
      left: bbLeft,
      top: bbTop,
      width: bbWidth,
      height: bbHeight
    });
  };

  const handleCancel = (event: PointerEvent) => {
    /*Cancel時の処理は後できちんと実装する*/
    /*pointeroutやpointerleaveも必要?*/
    handleUp(event);
  };

  /*4隅 + 4点(合計8点)のハンドルはループで配置*/
  return (
    <div
      ref={CLayer}
      id="ControlLayer"
      style={{
        position: "absolute",
        display: setVisibility(),
        cursor: "crosshair"
      }}
    >
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
          ref={BBRect}
          id={"BBRect"}
          x={bbLeft}
          y={bbTop}
          width={bbWidth}
          height={bbHeight}
          fill="#01bc8c"
          fillOpacity="0.25"
        />
        <rect
          id={"BBRectButton"}
          x={bbLeft + bbWidth / 2}
          y={bbHeight + 50}
          width={bbWidth / 2}
          height={50}
          fill="gray"
          fillOpacity="1"
        />
      </svg>
    </div>
  );
};
