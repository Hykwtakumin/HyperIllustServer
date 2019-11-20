import * as React from "react";
import { useState, useRef, FC, useEffect, createElement } from "react";
import {
  Points,
  getPoint,
  EditorMode,
  PointerEvents,
  Group,
  Stroke,
  drawPoint,
  Size
} from "./share/utils";
import { PathDrawer } from "./Graphics/PathDrawer";
import { PenWidthSelector } from "./PenWidthSelector";
import { ColorPicker } from "./ColorPicker";
import { ModeSelector } from "./ModeSelector";
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
import { StrokeDrawer } from "./Graphics/StrokeDrawer";
import { GroupDrawer } from "./Graphics/GroupDrawer";
import { ResetDialog } from "./ResetDialog";

interface MainCanvasProps {}

export const MainCanvas = (props: MainCanvasProps) => {
  const [penWidth, setPenWidth] = useState<number>(6);
  const [color, setColor] = useState<string>("#585858");
  const [editorMode, setEditorMode] = useState<EditorMode>("draw");
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  //リアルタイムで描画する座標
  const [points, setPoints] = useState<drawPoint[]>([]);
  //通常のストローク
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  //グループ化した要素たち
  const [groups, setGroups] = useState<Group[]>([]);
  //ドラッグ中のboolean
  const [isDragging, setIsDragging] = useState<boolean>(false);
  //要素のpointer-events
  const [events, setEvents] = useState<PointerEvents>("none");
  //モーダルの表示
  const [isOpen, setIsOpen] = useState<boolean>(false);
  //キャンバスのref
  const canvasRef = useRef<SVGSVGElement>(null);
  //BB判定用Rectのref
  const inRectRef = useRef<SVGRectElement>(null);
  //描画用レイヤーのref
  const pointsRect = useRef<SVGElement>(null);
  //BBの寸法
  const [inRectSize, setInrectSize] = useState<Size>({
    left: 0,
    top: 0,
    width: 0,
    height: 0
  });
  //BBで選択対象になった要素のidのリスト
  const [selectedElms, setSelectedElms] = useState<string[]>([]);

  //今までアップロードしてきたHyperIllustのリスト(とりあえずlocalStorageに保存している)
  const [localIllustList, setLocalIllustList] = useState<HyperIllust[]>(
    loadHyperIllusts()
  );

  //一度編集したらkeyを設定する
  //以後編集される度にkeyを設定する
  const [itemURL, setItemURL] = useState<string>("");

  //一度UserIdを発行されたら基本的にそれを使い続ける感じで
  const [user, setUser] = useState<HyperIllustUser>(null);

  //長押し判定用タイマー
  const timerId = useRef<number>(null);

  //リンク付けるようモーダルの表示非表示
  const [isShow, setIsShow] = useState<boolean>(false);

  //PointerDownしたときの座標
  const [initialPoint, setInitialPoint] = useState<Points>({ x: 0, y: 0 });

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

  const onModeChange = () => {
    //編集モードとPointerEventsの切り替え
    if (editorMode === "draw") {
      setEditorMode("edit");
      setEvents("auto");
    } else {
      setEditorMode("draw");
      setEvents("none");
    }
  };

  //BBがリサイズされたときに走る
  const updateInterSections = () => {
    const list = Array.from(
      canvasRef.current.getIntersectionList(inRectRef.current.getBBox(), null)
    );
    //選択されたPathのIDを配列に入れていく
    setSelectedElms(
      list.reduce((prev, curr, index) => {
        prev.push(curr.id);
        return prev;
      }, [])
    );
    //StrokeのisSelected要素を入れ替えていく
    setStrokes(
      strokes.reduce((prev, curr, index) => {
        curr.isSelected = selectedElms.includes(curr.id);
        prev.push(curr);
        return prev;
      }, [])
    );
  };

  //元に戻す
  const handleUndo = event => {
    const newStrokes = strokes.filter((stroke, index) => {
      return index !== strokes.length - 1;
    });
    setStrokes(newStrokes);
  };

  //全部消去
  const handleAllClear = () => {
    setPoints([]);
    setStrokes([]);
    setSelectedElms([]);
    setGroups([]);
    setIsOpen(false);
  };

  const handleDown = (event: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(true);

    const now = getPoint(event.pageX, event.pageY, canvasRef.current);

    //PointerDownしたときの初期座標を設定
    setInitialPoint({ x: Math.floor(now.x), y: Math.floor(now.y) });

    if (editorMode === "draw") {
      const newPoint: drawPoint = {
        x: Math.floor(now.x),
        y: Math.floor(now.y)
      };

      setPoints([...points, newPoint]);
    } else {
      //編集モードのときはBBやパスの操作ということにする
      handleBBDown(event);
    }

    //タイマーをセット
    timerId.current = window.setTimeout(() => {
      console.log("300ms elapsed!");
      //描画点を消す
      setPoints([]);
      onModeChange();
    }, 300);
  };

  const handleBBDown = (event: React.PointerEvent<SVGSVGElement>) => {
    //selectedListが設定されている場合はリセットする
    setSelectedElms([]);
    const now = getPoint(event.pageX, event.pageY, canvasRef.current);
    setInrectSize({
      left: Math.floor(now.x),
      top: Math.floor(now.y),
      width: 0,
      height: 0
    });
    //
  };

  const handleMove = (event: React.PointerEvent<SVGSVGElement>) => {
    //タイマーをリセットする
    //pointsのgetBoundingBoxが一定サイズ以下の場合に限りタイマーをリセットする
    if (isDragging) {
      if (editorMode === "draw") {
        const now = getPoint(event.pageX, event.pageY, canvasRef.current);
        const newPoint: drawPoint = {
          x: Math.floor(now.x),
          y: Math.floor(now.y)
        };
        setPoints([...points, newPoint]);

        const strokeDrawer = document.getElementById("strokeDrawer");
        if (strokeDrawer) {
          const drawingRect = strokeDrawer.getBoundingClientRect();
          if (drawingRect.height > 5 && drawingRect.width > 5) {
            console.log("動いているのでタイマーをリセット");
            timerId.current && clearTimeout(timerId.current);
          }
        }
      } else {
        handleBBMove(event);
      }
    }
  };

  const handleBBMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const now = getPoint(event.pageX, event.pageY, canvasRef.current);
    if (
      Math.floor(now.x) > inRectSize.left &&
      Math.floor(now.y) > inRectSize.top
    ) {
      setInrectSize({
        left: initialPoint.x,
        top: initialPoint.y,
        width: Math.floor(now.x) - initialPoint.x,
        height: Math.floor(now.y) - initialPoint.y
      });
      updateInterSections();
    }

    if (inRectSize.height > 5 && inRectSize.width > 5) {
      //動いているのでタイマーをリセット
      timerId.current && clearTimeout(timerId.current);
    }
  };

  const handleUp = (event: React.PointerEvent<SVGSVGElement>) => {
    console.log("onPointerUp!");
    //タイマーをリセットする
    timerId.current && clearTimeout(timerId.current);
    setIsDragging(false);
    if (editorMode === "draw") {
      const newStroke: Stroke = {
        id: `${Math.floor(event.pageX)}-${Math.floor(event.pageY)}`,
        points: points,
        isSelected: false
      };

      setStrokes([...strokes, newStroke]);

      //pointsはリセットする
      setPoints([]);

      //PointerEventによらずアップロードしたい
      //handleUpSert();
    } else {
      handleBBUp(event);
    }
  };

  const handleBBUp = (event: React.PointerEvent<SVGSVGElement>) => {
    updateInterSections();
    if (selectedElms && selectedElms.length > 0) {
      popUpAddLinkModal();
    }
  };

  const handleUpSert = async () => {
    setEvents("auto");
    if (!itemURL) {
      //アップロードする
      const result = await uploadSVG(canvasRef.current, user.name);
      console.log(result);
      //ローカルに保存
      const saveResult = await saveToLocalStorage(result.id, result);
      console.log(`saveResult : ${saveResult}`);

      //再設定
      setLocalIllustList(loadHyperIllusts());
      //itemURLを設定
      setItemURL(result.sourceKey);
      //URLを変更する
      window.history.replaceState(
        null,
        null,
        `/${user.name}/${result.sourceKey}`
      );
    } else {
      //既にSVGはあるので上書きさせる
      //アップロードする
      const result = await updateSVG(canvasRef.current, itemURL);
      console.log(result);
    }
    //アップロード後はしっかりpointer-eventsを無効化しておく
    setEvents("none");
  };

  //Importは
  const handleImport = async (sourceKey: string) => {
    console.log(`handleImport: ${sourceKey}`);
    try {
      const request = await fetch(`/api/import/${encodeURI(sourceKey)}`);
      const svg = await request.text();
      console.dir(svg);
      //ロードにはしばらく時間がかかるのでSpinnerとかを表示した方がよいかも?
      canvasRef.current.insertAdjacentHTML("beforeend", svg);
      //ロードしたら編集モードに以降する
      setEditorMode("edit");
      //BoundingBoxを表示する
      const lastSVG = canvasRef.current.lastChild as SVGElement;
      // setInitialBBSize({
      //   left: 0,
      //   top: 0,
      //   width: parseInt(lastSVG.getAttribute("width")),
      //   height: parseInt(lastSVG.getAttribute("height"))
      // });
      //lastPathとかlastGroup相当のlastSVGを設定する
    } catch (error) {
      console.log("failed to import svg!");
      console.log(error);
    }
  };

  const handleExport = async () => {
    //リンクを埋め込んだPathがしっかりクリックできるようにしておく
    setEvents("auto");
    try {
      const result = await uploadSVG(canvasRef.current, user.name);
      console.log("アップロードに成功しました!");
      console.log(result);
      /*TODO APIとかSchemeをきちんと設定する*/

      //ローカルに保存
      const saveResult = await saveToLocalStorage(result.id, result);
      console.log(`saveResult : ${saveResult}`);

      //再設定
      setLocalIllustList(loadHyperIllusts());
      //アップロード後はしっかりpointer-eventsを無効化しておく
      setEvents("none");
      window.open(result.sourceURL);
    } catch (error) {
      console.dir(error);
      alert("何か問題が発生しました!");
    }
  };

  // //部分Export
  // const handleClippedExport = async () => {
  //   setPointerEventsEnableToAllPath(canvasRef.current);
  //   const clipped: SVGElement = document.createElementNS(
  //     "http://www.w3.org/2000/svg",
  //     "svg"
  //   );
  //   clipped.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  //   clipped.setAttribute("width", `${lastBBSize.width}`);
  //   clipped.setAttribute("height", `${lastBBSize.height}`);
  //   clipped.setAttribute(
  //     "viewBox",
  //     `${lastBBSize.left} ${lastBBSize.top} ${lastBBSize.width} ${
  //       lastBBSize.height
  //     }`
  //   );
  //   clipped.setAttribute("xmlns:xlink", `http://www.w3.org/1999/xlink`);
  //   clipped.appendChild(lastGroup);
  //
  //   const blobObject: Blob = new Blob(
  //     [new XMLSerializer().serializeToString(clipped)],
  //     { type: "image/svg+xml;charset=utf-8" }
  //   );
  //
  //   const formData = new FormData();
  //   formData.append(`file`, blobObject);
  //
  //   const opt = {
  //     method: "POST",
  //     body: formData
  //   };
  //
  //   try {
  //     const userName = location.href.split("/")[3];
  //     const request = await fetch(`/api/upload/${userName}`, opt);
  //     const result: HyperIllust = await request.json();
  //     console.log("アップロードに成功しました!");
  //     console.log(result);
  //
  //     const saveResult = await saveToLocalStorage(result.id, result);
  //     console.log(`saveResult : ${saveResult}`);
  //
  //     //再設定
  //     setLocalIllustList(loadHyperIllusts());
  //     //アップロード後はしっかりpointer-eventsを無効化しておく
  //     setPointerEventsDisableToAllPath(canvasRef.current);
  //     window.open(result.sourceURL);
  //   } catch (error) {
  //     console.dir(error);
  //     alert("何か問題が発生しました!");
  //   }
  // };

  //リンクの追加
  const handleAddLink = (item: HyperIllust) => {
    if (selectedElms) {
      console.log(`itemId: ${item.id}`);
      //新しいGroupを作成し、そこに追加する
      const selectedStrokes = strokes.reduce((prev, curr) => {
        if (selectedElms.includes(curr.id)) {
          curr.isSelected = false;
          prev.push(curr);
        }
        return prev;
      }, []);
      const newGroup: Group = {
        id: `${Date.now()}`,
        href: item.sourceURL,
        strokes: selectedStrokes,
        transform: ""
      };
      setGroups([...groups, newGroup]);
      //selectedにある要素をstrokesから削除する
      setStrokes(
        strokes.reduce((prev, curr) => {
          if (!selectedElms.includes(curr.id)) {
            prev.push(curr);
          }
          return prev;
        }, [])
      );
      //selectedな要素をクリアーする
      setSelectedElms([]);
    } else {
      console.log("要素が選択されていません");
    }
  };

  const inner = (
    <div className="ImportModalMenuContainer">
      <div className="ImportModalMenu">
        {localIllustList.map((item: HyperIllust, index: number) => {
          return (
            <img
              key={index}
              className={"ImportModalItem"}
              alt={item.id}
              title={item.id}
              src={item.sourceURL}
              width={100}
              height={80}
              onClick={() => {
                handleAddLink(item);
              }}
            />
          );
        })}
      </div>
    </div>
  );

  const popUpAddLinkModal = () => {
    showModal({
      type: "confirm",
      title: <h2>{`他のイラストと紐付ける`}</h2>,
      content: (
        <>
          <div>
            <h3>{`以下のリストから選択`}</h3>
            {inner}
          </div>
        </>
      ),
      onCancel() {},
      cancelText: "キャンセル"
    });
  };

  const { showModal } = useModal();

  return (
    <>
      <svg
        ref={canvasRef}
        className={"svgCanvas"}
        viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
        width={canvasSize.width}
        height={canvasSize.height}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
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
        <PathDrawer points={points} />
        <StrokeDrawer strokes={strokes} events={events} />
        <GroupDrawer groupElms={groups} events={events} />
        <rect
          display={editorMode === "draw" ? "none" : ""}
          ref={inRectRef}
          x={inRectSize.left}
          y={inRectSize.top}
          width={inRectSize.width}
          height={inRectSize.height}
          stroke="none"
          fill="#01bc8c"
          fillOpacity="0.25"
          pointerEvents={events}
        />
      </svg>

      <div className="toolBarContainer">
        <div className="toolBar">
          <PenWidthSelector widthChange={onWidthChange} />
          <ColorPicker colorChange={onColorChange} />
          <ModeSelector text={editorMode} modeChange={onModeChange} />

          <div style={{ padding: "3px" }}>
            <ButtonComponent type={"default"} onClick={handleUndo}>
              {"元に戻す"}
            </ButtonComponent>
          </div>

          <div style={{ padding: "3px" }}>
            <ButtonComponent
              type={"default"}
              onClick={() => {
                setIsOpen(true);
              }}
            >
              {"リセット"}
            </ButtonComponent>
          </div>

          <AddInnerLinkButton
            onSelected={handleAddLink}
            localIllustList={localIllustList}
          />

          <ImportButton
            onSelected={handleImport}
            localIllustList={localIllustList}
          />

          {/*<ExportButton*/}
          {/*  onExport={handleClippedExport}*/}
          {/*  selectedElms={selectedElms}*/}
          {/*/>*/}

          {/*<UploadButton onExport={handleExport} selectedElms={selectedElms} />*/}

          <ResetDialog
            isShow={isOpen}
            onOk={handleAllClear}
            onCancel={() => {
              setIsOpen(false);
            }}
          />
        </div>
      </div>
    </>
  );
};
