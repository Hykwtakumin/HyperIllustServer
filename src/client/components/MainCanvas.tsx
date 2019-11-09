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
import { HyperIllust, HyperIllustUser } from "../../share/model";
import { saveToLocalStorage } from "./share/localStorage";
import { UploadButton } from "./UploadButton";
import { loadUserInfo, setUserInfo } from "./share/UserSetting";
import { AddInnerLinkButton } from "./AddInnerLinkButton";
import { updateSVG, uploadSVG } from "./share/API";

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
  const [initialBBSize, setInitialBBSize] = useState<BBSize>(null);

  //今までアップロードしてきたHyperIllustのリスト(とりあえずlocalStorageに保存している)
  const [localIllustList, setLocalIllustList] = useState<HyperIllust[]>(
    loadHyperIllusts()
  );

  //一度編集したらkeyを設定する
  //以後編集される度にkeyを設定する
  const [itemURL, setItemURL] = useState<string>("");

  //一度UserIdを発行されたら基本的にそれを使い続ける感じで
  const [user, setUser] = useState<HyperIllustUser>(null);

  useEffect(() => {
    const user = loadUserInfo();
    if (user) {
      /*設定されている*/
      setUser(user);
      if (location.href.split("/")[3] !== user.name) {
        window.history.replaceState(null, null, `/${user.name}`);
      }
    } else {
      /*設定されていない*/
      setUserInfo();
      const newUser = loadUserInfo();
      if (newUser) {
        setUser(newUser);
        window.history.replaceState(null, null, `/${newUser.name}`);
      }
    }
  }, []);

  //BBで選択されたPathのリスト
  //const [selectedElms, setSelectedElms] = useState<SVGElement[]>(null);
  let selectedElms: SVGElement[];

  let isDragging: boolean = false;
  let lastPath;
  let lastGroup: SVGGElement;
  let lastBBSize: BBSize;
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
  const handleMove = (
    event: React.SyntheticEvent<HTMLElement, PointerEvent>
  ) => {
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
    //PointerEventによらずアップロードしたい
    handleUpSert();
  };

  const handleUpSert = async () => {
    setPointerEventsEnableToAllPath(svgCanvas.current);
    if (!itemURL) {
      //アップロードする
      const result = await uploadSVG(svgCanvas.current, user.name);
      console.log(result);
      //ローカルに保存
      const saveResult = await saveToLocalStorage(result.id, result);
      console.log(`saveResult : ${saveResult}`);

      //再設定
      setLocalIllustList(loadHyperIllusts());
      //itemURLを設定
      setItemURL(result.sourceKey);
    } else {
      //既にSVGはあるので上書きさせる
      //アップロードする
      const result = await updateSVG(svgCanvas.current, itemURL);
      console.log(result);
    }
    //アップロード後はしっかりpointer-eventsを無効化しておく
    setPointerEventsDisableToAllPath(svgCanvas.current);
  };

  //Importは
  const handleImport = async (sourceKey: string) => {
    console.log(`handleImport: ${sourceKey}`);
    try {
      const request = await fetch(`/api/import/${encodeURI(sourceKey)}`);
      const svg = await request.text();
      console.dir(svg);
      //ロードにはしばらく時間がかかるのでSpinnerとかを表示した方がよいかも?
      svgCanvas.current.insertAdjacentHTML("beforeend", svg);
      //ロードしたら編集モードに以降する
      setEditorMode(EditorMode.edit);
      //BoundingBoxを表示する
      const lastSVG = svgCanvas.current.lastChild as SVGElement;
      setInitialBBSize({
        left: 0,
        top: 0,
        width: parseInt(lastSVG.getAttribute("width")),
        height: parseInt(lastSVG.getAttribute("height"))
      });
      //lastPathとかlastGroup相当のlastSVGを設定する
    } catch (error) {
      console.log("failed to import svg!");
      console.log(error);
    }
  };

  const handleExport = async () => {
    //リンクを埋め込んだPathがしっかりクリックできるようにしておく
    setPointerEventsEnableToAllPath(svgCanvas.current);
    try {
      const result = await uploadSVG(svgCanvas.current, user.name);
      console.log("アップロードに成功しました!");
      console.log(result);
      /*TODO APIとかSchemeをきちんと設定する*/

      //ローカルに保存
      const saveResult = await saveToLocalStorage(result.id, result);
      console.log(`saveResult : ${saveResult}`);

      //再設定
      setLocalIllustList(loadHyperIllusts());
      //アップロード後はしっかりpointer-eventsを無効化しておく
      setPointerEventsDisableToAllPath(svgCanvas.current);
      window.open(result.sourceURL);
    } catch (error) {
      console.dir(error);
      alert("何か問題が発生しました!");
    }
  };

  //部分Export
  const handleClippedExport = async () => {
    if (!lastGroup) {
      insertElmsToGroup();
    }

    setPointerEventsEnableToAllPath(svgCanvas.current);
    const clipped: SVGElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    clipped.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clipped.setAttribute("width", `${lastBBSize.width}`);
    clipped.setAttribute("height", `${lastBBSize.height}`);
    clipped.setAttribute(
      "viewBox",
      `${lastBBSize.left} ${lastBBSize.top} ${lastBBSize.width} ${
        lastBBSize.height
      }`
    );
    clipped.setAttribute("xmlns:xlink", `http://www.w3.org/1999/xlink`);
    clipped.appendChild(lastGroup);

    const blobObject: Blob = new Blob(
      [new XMLSerializer().serializeToString(clipped)],
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

      const saveResult = await saveToLocalStorage(result.id, result);
      console.log(`saveResult : ${saveResult}`);

      //再設定
      setLocalIllustList(loadHyperIllusts());
      //アップロード後はしっかりpointer-eventsを無効化しておく
      setPointerEventsDisableToAllPath(svgCanvas.current);
      window.open(result.sourceURL);
    } catch (error) {
      console.dir(error);
      alert("何か問題が発生しました!");
    }
  };

  //selectedListをg要素の中に突っ込む関数
  const insertElmsToGroup = () => {
    if (selectedElms) {
      //g要素を新規作成
      const groupElm: SVGGElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      //g要素を追加
      svgCanvas.current.appendChild(groupElm);
      selectedElms.forEach(elm => {
        const copyElm = elm.parentNode.removeChild(elm);
        groupElm.appendChild(copyElm);
      });
      //lastGroupに代入
      lastGroup = groupElm;
    } else {
      console.log("selectedElms is null!");
    }
  };

  //BBを作った時点ではグループ化する必要はない
  //リストは作るがグループ化は変形し始めてからで良い
  const handleBBResized = (size: BBSize) => {
    console.dir(size);
    const interCanvas = svgCanvas.current as SVGSVGElement;

    const inRect = interCanvas.createSVGRect();

    lastBBSize = size;

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
    //setSelectedElms(Array.from(list));
    selectedElms = list;
    //リストにぶちこんだ後はしっかりpointer-eventsを無効化しておく
    setPointerEventsDisableToAllPath(interCanvas);
    console.log(`SelectedElms : ${selectedElms}`);
  };

  //もしもlastGroupが設定されていればそのAttributeを操作する
  //設定されていなければlastListを元にGroupを作成する
  //lastListもnullだった場合は何もしない
  const handleBBMoved = (size: BBMoveDiff) => {
    console.dir(`diffX: ${size.diffX}, diffY: ${size.diffY}`);
    //選択された要素を変形(平行移動)していく
    if (lastGroup) {
      lastGroup.setAttribute(
        "transform",
        `translate(${size.diffX},${size.diffY})`
      );
      return;
    } else {
      // insertElmsToGroup();
      // lastGroup.setAttribute(
      //   "transform",
      //   `translate(${size.diffX},${size.diffY})`
      // );
      console.log("something went wrong");
      insertElmsToGroup();
    }
  };

  /*選択したパスにリンクを追加する処理*/
  /*この時点でグループ化してしまっても良いはず*/
  const handleAddLink = (link: string) => {
    console.log(`link: ${link}`);
    if (selectedElms && selectedElms.length > 0) {
      const groupElm: SVGGElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      //g要素を追加
      svgCanvas.current.appendChild(groupElm);

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
        groupElm.appendChild(linkElm);
      });

      //lastGroupに代入
      lastGroup = groupElm;

      //setPointerEventsEnableToAllPath();
      //リンクを貼り終わったらselectedElmsを空にする
      //空にして良いのだろうか?
      //setSelectedElms([]);
      selectedElms = [];
    }
  };

  return (
    <>
      <ModalProvider>
        <div className={"toolBar"}>
          <PenWidthSelector widthChange={onWidthChange} />
          <ColorPicker colorChange={onColorChange} />
          <ModeSelector modeChange={onModeChange} />

          <AddInnerLinkButton
            onSelected={handleAddLink}
            localIllustList={localIllustList}
          />

          <ImportButton
            onSelected={handleImport}
            localIllustList={localIllustList}
          />

          <ExportButton
            onExport={handleClippedExport}
            selectedElms={selectedElms}
          />

          <UploadButton onExport={handleExport} selectedElms={selectedElms} />
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
            <defs>
              <style type={"text/css"}>{`<![CDATA[
                path:hover: {
                  stroke: red;
                  transition: 0.5s;
                }
              
                a:hover {
                  fill: dodgerblue;
                  stroke: dodgerblue;
                  transition: 0.5s;
                }
                
                a:active {
                  fill: dodgerblue;
                  stroke: dodgerblue;
                  transition: 0.5s;
                }
           ]]>`}</style>
            </defs>
            <rect width="100%" height="100%" fill="#FFFFFF" />
          </svg>
        </div>
        <div className="ControlSection">
          <BoundingBox
            visible={setBBVisibility()}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            initialBBSize={initialBBSize}
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
