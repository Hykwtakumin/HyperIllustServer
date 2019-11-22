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
  Size,
  DrawPreset
} from "./share/utils";
import { PathDrawer } from "./Graphics/PathDrawer";
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
import { DrawPresets } from "./DrawPresets";
import { ImportDialog } from "./ImportDialog";
import { ViewLinkDialog } from "./ViewLinkDialog";

interface MainCanvasProps {
  loadedStrokes?: Stroke[];
  loadedGroups?: Group[];
}

export const MainCanvas = (props: MainCanvasProps) => {
  const [penWidth, setPenWidth] = useState<number>(6);
  const [color, setColor] = useState<string>("#585858");
  const [editorMode, setEditorMode] = useState<EditorMode>(
    props.loadedStrokes ? "edit" : "draw"
  );
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  //リアルタイムで描画する座標
  const [points, setPoints] = useState<drawPoint[]>([]);
  //通常のストローク
  const [strokes, setStrokes] = useState<Stroke[]>(props.loadedStrokes || []);
  //グループ化した要素たち
  const [groups, setGroups] = useState<Group[]>(props.loadedGroups || []);
  //ドラッグ中のboolean
  const [isDragging, setIsDragging] = useState<boolean>(false);
  //要素のpointer-events
  const [events, setEvents] = useState<PointerEvents>("none");
  //クリアモーダルの表示
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  //画像Importモーダルの表示
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  //関連画像モーダルの表示
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  //キャンバスのref
  const canvasRef = useRef<SVGSVGElement>(null);
  //BB判定用Rectのref
  const inRectRef = useRef<SVGRectElement>(null);
  //描画用レイヤーのref
  const pointsRect = useRef<SVGElement>(null);
  //BBの寸法
  const [inRectSize, setInRectSize] = useState<Size>({
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

  //引用したHyperIllustのリスト
  const [referedIllusts, setReferedIllusts] = useState<string[]>([]);

  //一度編集したらkeyを設定する
  //以後編集される度にkeyを設定する
  const [itemURL, setItemURL] = useState<string>("");

  //一度UserIdを発行されたら基本的にそれを使い続ける感じで
  const [user, setUser] = useState<HyperIllustUser>(null);

  //長押し判定用タイマー
  const gestureTimerId = useRef<number>(null);

  //debounceアップロード用タイマー
  const upLoadTimerId = useRef<number>(null);

  //リンク付けるようモーダルの表示非表示
  const [isShow, setIsShow] = useState<boolean>(false);

  //PointerDownしたときの座標
  const [initialPoint, setInitialPoint] = useState<Points>({ x: 0, y: 0 });

  //4種類の描画プリセット
  const [preset, setPreset] = useState<DrawPreset>("normal");

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

  //プリセットによってペンの色や幅を変える
  useEffect(() => {
    console.log(`preset changed! : ${preset}`);
    if (preset === "bold") {
      setPenWidth(10);
      setColor("#585858");
    } else if (preset === "shadow") {
      setPenWidth(6);
      setColor("rgba(0,0,0,.25)");
    } else if (preset === "highLight") {
      setPenWidth(6);
      setColor("rgba(255,141,60,0.8)");
    } else {
      setPenWidth(6);
      setColor("#585858");
    }
  }, [preset]);

  /*on Canvas Resize*/
  window.onresize = () => {
    setCanvasSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  const switchEditorMode = () => {
    editorMode === "draw" ? setEditorMode("edit") : setEditorMode("draw");
  };

  //editorModeが変わるとPointerEventも変わる
  useEffect(() => {
    editorMode === "draw" ? setEvents("none") : setEvents("auto");
  }, [editorMode]);

  //BBがリサイズされたときに走る
  useEffect(() => {
    //BBがリサイズされる度に交差判定を行う
    const list = Array.from(
      canvasRef.current.getIntersectionList(inRectRef.current.getBBox(), null)
    );

    //背景の要素やBB本体は含まない
    list.shift();
    list.pop();

    //選択されたPathのIDを配列に入れていく
    setSelectedElms(
      list.reduce((prev, curr, index) => {
        prev.push(curr.id);
        return prev;
      }, [])
    );
  }, [inRectSize]);

  //StrokeのisSelected要素を入れ替えていく
  useEffect(() => {
    setStrokes(
      strokes.reduce((prev, curr, index) => {
        curr.isSelected = selectedElms.includes(curr.id);
        prev.push(curr);
        return prev;
      }, [])
    );
  }, [selectedElms]);

  //引用したイラストのリストを設定する
  useEffect(() => {
    console.log(
      groups.reduce((prev, curr, index) => {
        prev.push(curr.href);
        return prev;
      }, [])
    );
    setReferedIllusts(
      groups.reduce((prev, curr, index) => {
        prev.push(curr.href);
        return prev;
      }, [])
    );
  }, [groups]);

  //描画とかが変更される度にアップロードする
  useEffect(() => {
    if (user && user.name && strokes.length > 0) {
      upLoadTimerId.current = window.setTimeout(() => {
        handleUpSert();
      }, 1500);
    } else {
      console.log("user is not defined!");
    }
  }, [strokes, groups]);

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
    setIsClearModalOpen(false);
  };

  const handleDown = (event: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(true);

    const now = getPoint(event.pageX, event.pageY, canvasRef.current);

    //PointerDownしたときの初期座標を設定
    setInitialPoint({ x: Math.floor(now.x), y: Math.floor(now.y) });
    //アップロード用タイマーをリセット
    upLoadTimerId.current && clearTimeout(upLoadTimerId.current);

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
    gestureTimerId.current = window.setTimeout(() => {
      console.log("300ms elapsed!");
      //描画点を消す
      setPoints([]);
      switchEditorMode();
    }, 500);
  };

  const handleBBDown = (event: React.PointerEvent<SVGSVGElement>) => {
    //selectedListが設定されている場合はリセットする
    setSelectedElms([]);
    const now = getPoint(event.pageX, event.pageY, canvasRef.current);
    setInRectSize({
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
            gestureTimerId.current && clearTimeout(gestureTimerId.current);
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
      setInRectSize({
        left: initialPoint.x,
        top: initialPoint.y,
        width: Math.floor(now.x) - initialPoint.x,
        height: Math.floor(now.y) - initialPoint.y
      });
      //updateInterSections();
    }

    if (inRectSize.height > 5 && inRectSize.width > 5) {
      //動いているのでタイマーをリセット
      gestureTimerId.current && clearTimeout(gestureTimerId.current);
    }
  };

  const handleUp = (event: React.PointerEvent<SVGSVGElement>) => {
    console.log("onPointerUp!");
    //タイマーをリセットする
    gestureTimerId.current && clearTimeout(gestureTimerId.current);
    setIsDragging(false);
    if (editorMode === "draw") {
      const newStroke: Stroke = {
        id: `${Math.floor(event.pageX)}-${Math.floor(event.pageY)}`,
        points: points,
        color: color,
        width: `${penWidth}`,
        isSelected: false
      };

      setStrokes([...strokes, newStroke]);

      //pointsはリセットする
      setPoints([]);

    } else {
      handleBBUp(event);
    }
  };

  const handleBBUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (selectedElms && selectedElms.length > 0) {
      setIsImportModalOpen(true);
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
        <desc
          stroke-data={JSON.stringify(strokes)}
          group-data={JSON.stringify(groups)}
        />
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
        <PathDrawer points={points} color={color} width={`${penWidth}`} />
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
          <ModeSelector text={editorMode} modeChange={switchEditorMode} />

          <DrawPresets
            preset={preset}
            onPresetChange={(preset: DrawPreset) => {
              console.dir(preset);
              setPreset(preset);
            }}
          />

          <div style={{ padding: "3px" }}>
            <ButtonComponent type={"green"} onClick={handleUndo}>
              <img
                src={"../icons/undo-24px.svg"}
                alt={"元に戻す"}
                title={"元に戻す"}
                draggable={false}
                style={{ transform: "scale(1.5)" }}
              />
            </ButtonComponent>
          </div>

          {/*<AddInnerLinkButton*/}
          {/*  onSelected={handleAddLink}*/}
          {/*  localIllustList={localIllustList}*/}
          {/*/>*/}

          <div style={{ padding: "3px" }}>
            <ButtonComponent
              type="green"
              onClick={() => {
                setIsLinkModalOpen(true);
              }}
            >
              <img
                src={"../icons/link-24px.svg"}
                alt={"リンク付要素を表示"}
                title={"リンク付要素を表示"}
                draggable={false}
                style={{ transform: "scale(1.5)" }}
              />
            </ButtonComponent>
          </div>

          <ImportButton
            onSelected={handleImport}
            localIllustList={localIllustList}
          />

          <div style={{ padding: "3px" }}>
            <ButtonComponent
              type={"primary"}
              onClick={event => {
                console.log(event);
              }}
            >
              <img
                src={"../icons/share-24px.svg"}
                alt={"共有する"}
                title={"共有する"}
                draggable={false}
                style={{ transform: "scale(1.5)" }}
              />
            </ButtonComponent>
          </div>

          <div style={{ padding: "3px" }}>
            <ButtonComponent
              type={"primary"}
              onClick={event => {
                console.log(event);
              }}
            >
              <img
                src={"../icons/collections-24px.svg"}
                alt={"画像一覧"}
                title={"画像一覧"}
                draggable={false}
                style={{ transform: "scale(1.5)" }}
              />
            </ButtonComponent>
          </div>

          <div style={{ padding: "3px" }}>
            <ButtonComponent
              type={"danger"}
              onClick={() => {
                setIsClearModalOpen(true);
              }}
            >
              <img
                src={"../icons/delete-24px.svg"}
                alt={"リセット"}
                title={"リセット"}
                draggable={false}
                style={{ transform: "scale(1.5)" }}
              />
            </ButtonComponent>
          </div>

          {/*<ExportButton*/}
          {/*  onExport={handleClippedExport}*/}
          {/*  selectedElms={selectedElms}*/}
          {/*/>*/}

          {/*<UploadButton onExport={handleExport} selectedElms={selectedElms} />*/}

          <ResetDialog
            isShow={isClearModalOpen}
            onOk={handleAllClear}
            onCancel={() => {
              setIsClearModalOpen(false);
            }}
          />

          <ImportDialog
            isShow={isImportModalOpen}
            onSelected={item => {
              handleAddLink(item);
              setIsImportModalOpen(false);
            }}
            localIllustList={localIllustList}
            onCancel={() => {
              setIsImportModalOpen(false);
            }}
          />

          <ViewLinkDialog
            isShow={isLinkModalOpen}
            onCancel={() => {
              setIsLinkModalOpen(false);
            }}
            referedIllusts={referedIllusts}
          />
        </div>
      </div>
    </>
  );
};
