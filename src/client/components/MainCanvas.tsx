import * as React from "react";
import { useState, useRef, FC, useEffect, createElement } from "react";
import { Points, getPoint } from "./utils";
import {
  addPath,
  updatePath,
  setPointerEventsEnableToAllPath,
  setPointerEventsDisableToAllPath
} from "./Graphics/PathDrawer";
import { PenWidthSelector } from "./PenWidthSelector";
import { ColorPicker } from "./ColorPicker";
import { ModeSelector } from "./ModeSelector";
import { BBMoveDiff, BBSize, BoundingBox } from "./BoundingBox";
import { createPortal } from "react-dom";
import {
  ButtonComponent,
  ModalContext,
  ModalProvider,
  ShowModal,
  useModal
} from "./share";
import { PublishButton } from "./PublishButton";
import { ImportButton, loadHyperIllusts, SelectedItem } from "./ImportButton";
import { ExportButton } from "./ExportButton";
import { HyperIllust } from "../../share/model";
import { saveToLocalStorage } from "./share/localStorage";
import { AddLinkButton } from "./AddLinkButton";

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

  //今までアップロードしてきたHyperIllustのリスト(とりあえずlocalStorageに保存している)
  const [localIllustList, setLocalIllustList] = useState<HyperIllust[]>(
    loadHyperIllusts()
  );

  //BBで選択されたPathのリスト
  const [selectedElms, setSelectedElms] = useState<SVGElement[]>(null);

  let isDragging: boolean = false;
  let lastPath;
  const svgCanvas = useRef<SVGSVGElement>(null);
  const { showModal } = useModal();

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

  const handleImport = (resourceURL: string) => {
    //サーバーからScrapboxの全ページを取得
    console.log(resourceURL);
    //
  };

  const handleExport = async () => {
    //リンクを埋め込んだPathがしっかりクリックできるようにしておく
    setPointerEventsEnableToAllPath(svgCanvas.current);
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
      console.log("アップロードに成功しました!");
      console.log(result);
      /*TODO APIとかSchemeをきちんと設定する*/

      const saveResult = await saveToLocalStorage(result.id, result);
      console.log(`saveResult : ${saveResult}`);

      //再設定
      setLocalIllustList(loadHyperIllusts());

      // showModal({
      //   type: "success",
      //   title: `アップロードに成功しました!`,
      //   content: <>
      //     <img src={result.sourceURL} width={200} />
      //   </>,
      //   okText: `閉じる`
      // });

      //アップロード後はしっかりpointer-eventsを無効化しておく
      setPointerEventsDisableToAllPath(svgCanvas.current);
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
    console.dir(inRect);
    //getIntersectionList関数はpointer-eventsが有効な要素しかカウントしない!!
    setPointerEventsEnableToAllPath(interCanvas);
    const list = Array.from(interCanvas.getIntersectionList(inRect, null));
    //背景の白い四角は除く
    const backGroundRect = list.shift();
    console.dir(list);
    setSelectedElms(list);
    //リストにぶちこんだ後はしっかりpointer-eventsを無効化しておく
    setPointerEventsDisableToAllPath(interCanvas);
    //そしてグループ要素を作ってすべて投入?
  };

  const handleBBMoved = (size: BBMoveDiff) => {
    console.dir(`diffX: ${size.diffX}, diffY: ${size.diffY}`);
    //選択された要素を変形(平行移動)していく
    //setPointerEventsEnableToAllPath(svgCanvas.current);
    if (selectedElms && selectedElms.length > 0) {
      selectedElms.forEach((elm: SVGElement) => {
        //item.setAttribute("transform", `translate(${size.diffX},${size.diffY})`);
        const copyPath = svgCanvas.current.removeChild(elm);

        copyPath.setAttribute(
          "transform",
          `translate(${size.diffX},${size.diffY})`
        );
        svgCanvas.current.appendChild(copyPath);

        // const itemX = parseInt(elm.getAttribute("x"));
        // const itemY = parseInt(elm.getAttribute("y"));
        // elm.setAttribute("x", `${itemX + size.diffX}`);
        // elm.setAttribute("y", `${itemY + size.diffY}`);
      });
    } else {
      console.log("something went wrong");
    }
    //setPointerEventsDisableToAllPath(svgCanvas.current);
  };

  /*選択したパスにリンクを追加する処理*/
  const handleAddLink = (link: string) => {
    console.log(`link: ${link}`);
    if (selectedElms && selectedElms.length > 0) {
      selectedElms.forEach((elm: SVGElement) => {
        //SVGAElementを新規作成してelmを囲っていく?
        //グループ化してしまう感じで
        const linkElm: SVGAElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "a"
        );
        linkElm.setAttribute("xlink:href", link);
        linkElm.setAttribute("target", "_blank");

        elm.appendChild(linkElm);
        elm.parentNode.insertBefore(linkElm, elm);

        const copyPath = svgCanvas.current.removeChild(elm);
        linkElm.appendChild(copyPath);
      });

      //setPointerEventsEnableToAllPath();
      //リンクを貼り終わったらselectedElmsを空にする
      setSelectedElms([]);
    }
  };

  return (
    <>
      <ModalProvider>
        <div className={"toolBar"}>
          <PenWidthSelector widthChange={onWidthChange} />
          <ColorPicker colorChange={onColorChange} />
          <ModeSelector modeChange={onModeChange} />

          <AddLinkButton
            onAddLink={handleAddLink}
            selectedElms={selectedElms}
          />

          <ImportButton
            onSelected={handleImport}
            localIllustList={localIllustList}
          />

          <ExportButton onExport={handleExport} selectedElms={selectedElms} />
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
                a:hover {
                  fill: dodgerblue;
                }
                
                a:active {
                  fill: dodgerblue;
                }
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
            onMoved={handleBBMoved}
            onRotated={() => {}}
            onRemoved={() => {}}
            onCopied={() => {}}
          />
        </div>
      </ModalProvider>
    </>
  );
};
