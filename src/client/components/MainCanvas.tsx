import * as React from "react";
import { useState, useRef, FC, useEffect } from "react";
import { eventHandler } from "./EventHandler";
import { Points, getPoint } from "./utils";
import {
  addPath,
  updatePath,
  setPointerEventsEnableToAllPath,
  setPointerEventsDisableToAllPath
} from "./PathDrawer";
import { PenWidthSelector } from "./PenWidthSelector";
import { ColorPicker } from "./ColorPicker";
import { ModeSelector } from "./ModeSelector";
import { BoundingBox } from "./BoundingBox";
import { createPortal } from "react-dom";
import { ButtonComponent, ModalProvider, useModal } from "./share";
import { PublishButton } from "./PublishButton";
import { ImportButton } from "./ImportButton";

interface MainCanvasProps {}

export enum EditorMode {
  draw,
  edit
}

export const MainCanvas = (props: MainCanvasProps) => {
  // Declare a new state variable, which we'll call "count"
  const [lastpath, setLastPath] = useState<SVGElement>(null);
  const [penWidth, setPenWidth] = useState<number>(6);
  const [color, setColor] = useState<string>("#585858");
  const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.draw);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  let isDragging: boolean = false;
  let lastPath;
  const svgCanvas = useRef(null);

  /*BoundingBox関連*/
  const [bbLeft, setBBLeft] = useState<number>(0);
  const [bbTop, setBBTop] = useState<number>(0);
  const [bbWidth, setBBWidth] = useState<number>(0);
  const [bbHeight, setBBHeight] = useState<number>(0);

  /*on Canvas Resize*/
  window.onresize = () => {
    setCanvasSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  /*ここらへんの部品も全て別コンポーネントに切り出す*/
  const onWidthChange = (event: React.SyntheticEvent<HTMLSelectElement>) => {
    console.log(`Penwidth changes! : ${event.target.value}`);
    setPenWidth(parseInt(event.target.value));
  };

  const onColorChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    console.log(`Color changes! : ${event.target.value}`);
    setColor(event.target.value);
  };

  const onModeChange = (event: React.SyntheticEvent<HTMLSelectElement>) => {
    console.log(`EditorMode changes! : ${event.target.value}`);
    if (event.target.value === "edit") {
      setEditorMode(EditorMode.edit);
    } else if (event.target.value === "draw") {
      setEditorMode(EditorMode.draw);
    }
  };

  const setCursorStyle = (): string => {
    if (editorMode === EditorMode.draw) {
      return "auto";
    } else if (editorMode === EditorMode.edit) {
      return "crosshair";
      /*さらにdrag中か否かでも分岐させる*/
      // if (isDragging) {
      //   return "grab";
      // } else {
      //   return "crosshair";
      // }
    }
  };

  const setBBVisibility = (): boolean => {
    if (editorMode === EditorMode.edit) {
      return true;
    } else if (editorMode === EditorMode.draw) {
      return false;
    }
  };

  const handleDown = (event: React.SyntheticEvent<HTMLElement>) => {
    event.persist();
    isDragging = true;
    if (editorMode === EditorMode.draw) {
      /*お絵かきモードの場合は線を描く*/
      const canvas = svgCanvas.current;
      const point: Points = getPoint(event.pageX, event.pageY, canvas);
      lastPath = addPath(canvas, point);
      lastPath.setAttribute("stroke", color);
      lastPath.setAttribute("stroke-width", `${penWidth}`);
      lastPath.classList.add("current-path");
      //console.dir(lastPath);
    } else if (editorMode === EditorMode.edit) {
      /*編集モードの場合はバウンディングボックスを召喚する*/
      const canvas = svgCanvas.current;
      const point: Points = getPoint(event.pageX, event.pageY, canvas);

      /*既にバウンディングボックスがある場合は消去して新規作成する*/
      console.log(event.target);
      if (bbLeft !== 0 && bbTop !== 0) {
        setBBLeft(0);
        setBBTop(0);
        setBBWidth(0);
        setBBHeight(0);

        setBBLeft(point.x);
        setBBTop(point.y);
      } else if (event.target && event.target.id === "BBRect") {
        /*BB系列の部品はスルー*/
        alert("このパスを公開します");
      } else {
        setBBLeft(point.x);
        setBBTop(point.y);
      }
    }
  };

  //これはhoverも担う?
  //下の要素がSVGAElementでリンクが設定されている場合は適当なモーダルを表示させる
  const handleMove = (event: React.SyntheticEvent<HTMLElement>) => {
    //event.persist();
    if (isDragging) {
      if (editorMode === EditorMode.draw) {
        if (lastPath) {
          const canvas = svgCanvas.current;
          const point: Points = getPoint(event.pageX, event.pageY, canvas);
          updatePath(lastPath, point);
          //console.dir(lastPath);
        } else {
          //console.log("something went wrong");
        }
      } else if (editorMode === EditorMode.edit) {
        /*編集モードの場合はバウンディングボックスのサイズを調整する*/
        // const canvas = svgCanvas.current;
        // const point: Points = getPoint(event.pageX, event.pageY, canvas);
        // setBBWidth(point.x - bbLeft);
        // setBBHeight(point.y - bbHeight);
      }
    }
  };

  //全消去の場合ダイアログを表示するべし
  const clearCanvas = () => {
    while (svgCanvas.current.firstChild) {
      svgCanvas.current.removeChild(svgCanvas.current.firstChild);
    }
  };

  const handleUp = (event: React.SyntheticEvent<HTMLElement>) => {
    //event.persist();
    isDragging = false;

    if (editorMode === EditorMode.draw) {
      lastPath.classList.remove("current-path");
      lastPath = null;
    } else if (editorMode === EditorMode.edit) {
      /*編集モードの場合はバウンディングボックスのサイズを調整する*/
      const canvas = svgCanvas.current;
      const point: Points = getPoint(event.pageX, event.pageY, canvas);
      setBBWidth(point.x - bbLeft);
      setBBHeight(point.y - bbHeight);
    }
  };

  const handleUpload = () => {
    const blobObject: Blob = new Blob(
      [new XMLSerializer().serializeToString(svgCanvas.current)],
      { type: "image/svg+xml;charset=utf-8" }
    );

    // const uploadObject = new XMLSerializer().serializeToString(
    //   svgCanvas.current
    // );
    // const uploadBody = {
    //   title: `hyperIllust.svg`,
    //   body: blobObject
    // };

    const formData = new FormData();
    formData.append(`file`, blobObject);

    const opt = {
      method: "POST",
      body: formData
    };
    fetch(`/api/upload`, opt)
      .then(res => {
        res
          .json()
          .then(async data => {
            console.log(await data);
          })
          .catch(e => console.log);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleNameEntered = (name: string) => {};

  const handlePublish = () => {
    //alert(publishForm.current.value);
    //setShowModal(true);
    // const clipedSVG = <svg viewBox={`${bbLeft} ${bbTop} ${bbWidth} ${bbHeight}`} width={bbWidth} height={bbHeight}>
    // </svg>

    //これlocalhostからではできない
    //fetch(`https://scrapbox.io/DrawWiki/${publishForm.current.value}?body=""`);

    //将来的にはこの処理はBoundingBoxにやらせる
    //BoundingBoxの大きさでRectを作る
    //単にCanvasサイズとViewBoxを縮めても全体がそのサイズに縮小されるだけで切り抜きはできない!
    // svgCanvas.current.setAttribute("viewBox", `${bbLeft} ${bbTop} ${bbWidth} ${bbHeight}`);
    // svgCanvas.current.setAttribute("width", `${bbWidth}`);
    // svgCanvas.current.setAttribute("height", `${bbHeight}`);
    const inRect = svgCanvas.current.createSVGRect();
    inRect.x = bbLeft;
    inRect.y = bbTop;
    inRect.width = bbWidth;
    inRect.height = bbHeight;
    const list = Array.from(
      svgCanvas.current.getIntersectionList(inRect, null)
    );

    //Rectの範囲にあるPathを選択する
    //モーダルを出す
    //グループ化してリンク貼り付け
    //Rectの範囲のWidth, Height, ViewBoxを持つSVGを新規作成して選択したPathをぶちこむ
  };

  const handleImport = (resourceURL: string) => {
    //サーバーからScrapboxの全ページを取得
    //
  };

  return (
    <>
      <ModalProvider>
        <div className={"toolBar"}>
          <PenWidthSelector widthChange={onWidthChange} />
          <ColorPicker colorChange={onColorChange} />
          <ModeSelector modeChange={onModeChange} />

          <PublishButton onUpload={handleUpload} />
          <ImportButton onSelected={handleImport} />

          <input
            type={"button"}
            value={"Uploadする"}
            className={"button toolButton leftButton"}
            onClick={handleUpload}
          />
        </div>

        <div
          className={"drawSection"}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
        >
          <svg
            ref={svgCanvas}
            className={"svgCanvas"}
            style={{ cursor: setCursorStyle() }}
            viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
            width={canvasSize.width}
            height={canvasSize.height}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <rect width="100%" height="100%" fill="#FFFFFF" />
            <defs>
              <style type={"text/css"}>{`<![CDATA[ 
            
           ]]>`}</style>
            </defs>
          </svg>

          <BoundingBox
            left={bbLeft}
            top={bbTop}
            width={bbWidth}
            height={bbHeight}
            visible={setBBVisibility()}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            onResized={() => {
              alert("Resized!");
            }}
            onRotated={() => {}}
            onRemoved={() => {}}
            onCopied={() => {}}
            onPublished={() => {}}
            onAddLink={() => {}}
          />
        </div>
      </ModalProvider>
    </>
  );
};
