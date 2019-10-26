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
import { BBSize, BoundingBox } from "./BoundingBox";
import { createPortal } from "react-dom";
import { ButtonComponent, ModalProvider, useModal } from "./share";
import { PublishButton } from "./PublishButton";
import { ImportButton } from "./ImportButton";
import { ExportButton } from "./ExportButton";
import { HyperIllust } from "../../share/model";

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
  const svgCanvas = useRef<SVGSVGElement>(null);

  /*on Canvas Resize*/
  window.onresize = () => {
    setCanvasSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  /*ここらへんの部品も全て別コンポーネントに切り出す*/
  const onWidthChange = (event: React.SyntheticEvent<HTMLSelectElement>) => {
    console.log(`Penwidth changes!`);
    setPenWidth(parseInt(event.target.value));
  };

  const onColorChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    console.log(`Color changes!`);
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

    const userName = location.href.split("/")[3];
    fetch(`/api/upload/${userName}`, opt)
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

  /*画像をアップロードする*/
  /*成功したらURLをクリップボードに貼り付けてメッセージを出す*/
  /*失敗したらアラートを出す*/
  const handlePublish = () => {
    //alert(publishForm.current.value);
    //setShowModal(true);
    // const clippedSVG = <svg viewBox={`${bbLeft} ${bbTop} ${bbWidth} ${bbHeight}`} width={bbWidth} height={bbHeight}>
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
    // inRect.x = bbLeft;
    // inRect.y = bbTop;
    // inRect.width = bbWidth;
    // inRect.height = bbHeight;
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

  const handleExport = async (title: string) => {
    //新しいタブを開いてScrapboxの書き込みAPIを使う

    const blobObject: Blob = new Blob(
      [new XMLSerializer().serializeToString(svgCanvas.current)],
      { type: "image/svg+xml;charset=utf-8" }
    );

    const formData = new FormData();
    formData.append(`file`, blobObject);

    const opt = {
      method: "POST",
      body: formData
    };

    try {
      const userName = location.href.split("/")[3];
      const request = await fetch(`/api/upload/${userName}`, opt);
      const result: HyperIllust = await request.json();
      console.log(result);
      /*TODO APIとかSchemeをきちんと設定する*/
      const imageURL = result.sourceURL;
      /*子要素のstateがちゃんと上がってこない*/
      console.log(`title : ${title}`);
      const pageTitle = encodeURI(title);
      const body = encodeURI(`[${imageURL}]`);
      window.open(`https://scrapbox.io/DrawWiki/${pageTitle}?body=${body}`);
    } catch (error) {
      console.dir(error);
      alert("何か問題が発生しました!");
    }
  };

  const handleBBResized = (size: BBSize) => {
    console.dir(size);
    const interCanvas = svgCanvas.current as SVGSVGElement;

    const inRect = interCanvas.createSVGRect();

    inRect.x = size.left;
    inRect.y = size.top;
    inRect.width = size.width;
    inRect.height = size.height;
    const list = Array.from(interCanvas.getIntersectionList(inRect, null));
    console.dir(list);
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

          <ExportButton onExport={handleExport} />
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
        </div>
        <div className="ControlSection">
          <BoundingBox
            visible={setBBVisibility()}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            onResized={handleBBResized}
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

// {/*<input*/}
// {/*  type={"button"}*/}
// {/*  value={"Uploadする"}*/}
// {/*  className={"button toolButton leftButton"}*/}
// {/*  onClick={handleUpload}*/}
// {/*/>*/}
