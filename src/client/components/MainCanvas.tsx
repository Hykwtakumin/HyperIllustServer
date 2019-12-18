import * as React from "react";
import { useState, useRef, FC, useEffect } from "react";
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
import { ButtonComponent } from "./share";
import { loadHyperIllusts } from "./ImportButton";
import { HyperIllust, HyperIllustUser } from "../../share/model";
import {
  deleteObjectFromLocalStorage,
  restoreFromLocalStorage,
  saveToLocalStorage
} from "./share/localStorage";
import { loadUserInfo, setUserInfo } from "./share/UserSetting";
import { deleteSVG, updateSVG, uploadSVG } from "./share/API";
import { StrokeDrawer } from "./Graphics/StrokeDrawer";
import { GroupDrawer } from "./Graphics/GroupDrawer";
import { ResetDialog } from "./ResetDialog";
import { DrawPresets } from "./DrawPresets";
import { ImportDialog } from "./ImportDialog";
import { ViewLinkDialog } from "./ViewLinkDialog";
import { LocalListDialog } from "./LocalListDialog";
import { ThumbDialog } from "./ThumbDialog";
import { defineReferToIllust } from "./share/referController";
import { ContextRect } from "./Graphics/ContextRect";
import { createGroup } from "./Graphics/GroupController";

export type MainCanvasProps = {
  loadedStrokes?: Stroke[];
  loadedGroups?: Group[];
  loadedReferred?: string[];
  loadedRefer?: string[];
  loadedImported?: string[];
  loadedImport?: string[];
};

export const MainCanvas: FC<MainCanvasProps> = (props: MainCanvasProps) => {
  const [penWidth, setPenWidth] = useState<number>(5);
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
  //画像一覧モーダルの表示
  const [isLocalListModalOpen, setIsLocalListModalOpen] = useState<boolean>(
    false
  );
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

  //クリックされたg要素
  const [selectedGroup, setSelectedGroup] = useState<Group>(null);

  //今までアップロードしてきたHyperIllustのリスト(とりあえずlocalStorageに保存している)
  const [localIllustList, setLocalIllustList] = useState<HyperIllust[]>(
    loadHyperIllusts()
  );

  //引用したHyperIllustのリスト
  const [referredIllusts, setReferredIllusts] = useState<string[]>(
    props.loadedReferred || []
  );
  //自分を引用しているHyperIllustのリスト
  const [referIllusts, setReferIllusts] = useState<string[]>(
    props.loadedRefer || []
  );

  //インポートした画像のリスト
  const [importedIllusts, setImportedIllusts] = useState<string[]>(
    props.loadedImported || []
  );
  //自分をインポートしている画像のリスト
  const [importIllusts, setImportIllusts] = useState<string[]>(
    props.loadedImport || []
  );

  //一度編集したらkeyを設定する
  //以後編集される度にkeyを設定する
  //URLから引き継いだ場合はこっちも引き継ぐ必要がある
  const [selfKey, setSelfKey] = useState<string>(
    location.href.split("/")[4] || ""
  );

  //一度UserIdを発行されたら基本的にそれを使い続ける感じで
  const [user, setUser] = useState<HyperIllustUser>(null);

  //長押し判定用タイマー
  const timerId = useRef<number>(null);

  //debounceUpload用タイマー
  const upLoadTimer = useRef<number>(null);

  //リンク付ける用モーダルの表示非表示
  const [isShow, setIsShow] = useState<boolean>(false);

  //選択されたイラストのkey
  const [selectedItemKey, setSelectedItemKey] = useState<string>("");

  //サムネイル用モーダル
  const [isThumbOpen, setIsThumbOpen] = useState<boolean>(false);

  //PointerDownしたときの座標
  const [initialPoint, setInitialPoint] = useState<Points>({ x: 0, y: 0 });

  //4種類の描画プリセット
  const [preset, setPreset] = useState<DrawPreset>("normal");

  //選択用BoundingBoxが生成されたかどうかのboolean
  const [isBBCreated, setIsBBCreated] = useState<boolean>(false);

  //ユーザー名を設定したりする
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
      setPenWidth(5);
      setColor("rgba(0,0,0,.25)");
    } else if (preset === "highLight") {
      setPenWidth(5);
      setColor("rgba(255,141,60,0.8)");
    } else {
      setPenWidth(5);
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
    //console.dir(list);
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

  //debounceUpload
  useEffect(() => {
    if (strokes.length > 0 && editorMode === "draw") {
      console.log(`strokes updated! : ${strokes.length}`);
      //編集モードのときにアップロードするとBBoxが出たりするので避けたい
      upLoadTimer.current && clearTimeout(upLoadTimer.current);
      //タイマーをセット
      //最後の変更から2秒経過でアップロード処理を行う
      upLoadTimer.current = window.setTimeout(() => {
        console.log("2000ms elapsed!");
        handleUpSert();
      }, 2000);
    }
  }, [strokes]);

  //グループを編集したときもアップロードする
  useEffect(() => {
    //引用したイラストのリストを設定する
    setReferredIllusts(
      groups.reduce((prev, curr, index) => {
        prev.push(curr.href);
        return prev;
      }, [])
    );

    if (groups.length > 0 && editorMode === "edit") {
      console.log(`groups updated! : ${groups.length}`);
      //編集モードのときにアップロードするとBBoxが出たりするので避けたい
      upLoadTimer.current && clearTimeout(upLoadTimer.current);
      //タイマーをセット
      //最後の変更から2秒経過でアップロード処理を行う
      upLoadTimer.current = window.setTimeout(() => {
        console.log("2000ms elapsed!");
        handleUpSert();
      }, 2000);
    }
  }, [groups]);

  //選択されたGroup要素が変わる度にサムネイル用ツールチップを表示する
  useEffect(() => {
    if (selectedGroup) {
      console.log(`現在次のグループが選択されています。: ${selectedGroup.id}`);
      const key = selectedGroup.href.split("/")[4];
      console.log(`そしてそのKeyは${key}です。`);
      setSelectedItemKey(key);
      setIsThumbOpen(true);
    }
  }, [selectedGroup]);

  //横の関連画像をクリックしてもサムネイル用ツールチップを表示する
  //グループ要素をハイライトする仕組みはあとで考える
  useEffect(() => {
    if (selectedItemKey) {
      const selectedGroup = groups.filter(group =>
        group.href.includes(selectedItemKey)
      );
      selectedGroup && setSelectedGroup(selectedGroup[0]);
      setIsThumbOpen(true);
    } else {
      setSelectedGroup(null);
    }
  }, [selectedItemKey]);

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
      switchEditorMode();
    }, 500);
  };

  const handleBBDown = (event: React.PointerEvent<SVGSVGElement>) => {
    //selectedListが設定されている場合はリセットする
    setSelectedElms([]);
    setSelectedGroup(null);
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
          if (drawingRect.height > 5 || drawingRect.width > 5) {
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
      setInRectSize({
        left: initialPoint.x,
        top: initialPoint.y,
        width: Math.floor(now.x) - initialPoint.x,
        height: Math.floor(now.y) - initialPoint.y
      });
    }

    if (inRectSize.height > 5 || inRectSize.width > 5) {
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
      setIsBBCreated(true);
    }
  };

  const handleUpSert = async () => {
    setEvents("auto");
    if (!selfKey) {
      console.log("URLが設定されていないので新規作成");
      //アップロードする
      const result = await uploadSVG(canvasRef.current, user.name);
      //インポートした画像をここで打ち込む
      const updated = defineReferToIllust(
        result,
        groups.map(group => group.href.split("/")[4])
      );
      console.dir(result);
      //ローカルに保存
      const saveResult = await saveToLocalStorage(result.id, updated);
      console.log(`saveResult : ${saveResult}`);

      //再設定
      setLocalIllustList(loadHyperIllusts());
      //itemURLを設定
      setSelfKey(result.sourceKey);
      //URLを変更する
      window.history.replaceState(
        null,
        null,
        `/${user.name}/${result.sourceKey}`
      );
    } else {
      //既にSVGはあるので上書きさせる
      console.log(`URLは設定されているので上書き: ${selfKey}`);
      //インポートした画像をここで打ち込む

      const updating = await restoreFromLocalStorage<HyperIllust>(selfKey);
      console.dir(updating);
      // //引用した画像をreferredIllustに代入しておく
      const updated = defineReferToIllust(
        updating,
        groups.map(group => group.href.split("/")[4])
      );
      console.dir(updated);

      //アップロードする
      const result = await updateSVG(canvasRef.current, selfKey);

      const saveResult = await saveToLocalStorage(result.id, updated);
      console.log(`saveResult : ${saveResult}`);
    }
    //アップロード後はしっかりpointer-eventsを無効化しておく
    //編集モードの場合は無効化する必要はない
    if (editorMode != "edit") {
      setEvents("none");
    }
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

  //削除処理
  const handleLocalImageDelete = async (item: HyperIllust) => {
    console.dir(item);
    const request = await deleteSVG(item.sourceKey);
    // if (request) {
    //   console.log("削除に成功");
    // } else {
    //   console.log("削除に失敗");
    // }
    deleteObjectFromLocalStorage(item.sourceKey);
    setLocalIllustList(
      localIllustList.filter(illust => {
        if (illust.sourceKey != item.sourceKey) {
          return illust;
        }
      })
    );
  };

  // //内部リンクをクリックしたときの処理
  // //ページ遷移はせずにその場でSVGを入れ替える
  // const handleReplaceSVG = (key: string) => {
  //   parseSVGFromURL(key).then(result => {
  //     setEditorMode("edit");
  //     setSelfKey(key);
  //     //URLも置き換える
  //     window.history.pushState(``, ``, `/${user.name}/${key}`);
  //
  //     const { loadedStrokes, loadedGroups, loadedReferred, loadedRefer, loadedImported, loadedImport } = result;
  //     setStrokes(loadedStrokes);
  //     setGroups(loadedGroups);
  //     setReferredIllusts(loadedReferred);
  //     setReferIllusts(loadedRefer);
  //     setImportedIllusts(loadedImported);
  //     setImportIllusts(loadedImport);
  //   }).catch(console.log);
  // };

  //変形(移動やリサイズを扱う関数)
  const handleTransformStart = (transform: string) => {
    if (selectedGroup) {
      //既にあるGroupを変形させる
      setGroups(groups.reduce((prev, curr) => {
        if (selectedGroup.id === curr.id) {
          curr.transform = transform;
        } else {
          prev.push(curr);
        }
        return prev;
      }, []));
    } else {
      //新規作成
      const newGroup = createGroup(
        selectedElms,
        strokes,
        ``,
        transform
      );

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
      setSelectedGroup(newGroup);
    }
  };

  //変形処理が一通りすんだら変形配列に記録する
  //TODO 操作のスタック化で戻せるようにする
  const handleTransformEnd = (transform: string) => {
    if (selectedGroup) {
    } else {

    }
  };

  const handleExport = () => {};

  //リンクの追加
  //グループに対しても上書きでリンクの追加(厳密には再編集)ができるようにする?
  const handleAddLink = (item: HyperIllust) => {
    console.dir(inRectRef.current);
    if (selectedElms && selectedElms.length > 0) {
      console.log(`itemId: ${item.id}`);

      const newGroup = createGroup(
        selectedElms,
        strokes,
        `https://draw-wiki.herokuapp.com/${item.sourceKey.split("_")[1] ||
          user.name}/${item.sourceKey}`
      );
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

  //選択された要素からグループを作成する
  //グループの中にグループがある場合はどうする?

  //BoundingBoxを消す処理
  const clearBB = () => {
    //選択された要素群をリセット
    setSelectedElms([]);
    //選択されたグループをリセット
    setSelectedGroup(null);
    //BBも非表示にする
    setIsBBCreated(false);
    //サイズもリセット
    setInRectSize({ left: 0, top: 0, width: 0, height: 0 });
    //編集モードからお絵かきモードに以降
    setEditorMode("draw");
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
          referred-data={JSON.stringify(referredIllusts)}
          refer-data={JSON.stringify(referIllusts)}
          imported-data={JSON.stringify(importedIllusts)}
          import-data={JSON.stringify(importIllusts)}
        />
        <defs />
        <rect width="100%" height="100%" fill="#FFFFFF" />
        <PathDrawer points={points} color={color} width={`${penWidth}`} />
        <StrokeDrawer strokes={strokes} events={events} />
        <GroupDrawer
          groupElms={groups}
          events={events}
          mode={editorMode}
          selectedGroup={selectedGroup}
          onGroupSelected={setSelectedGroup}
        />
        <rect
          ref={inRectRef}
          x={inRectSize.left}
          y={inRectSize.top}
          width={inRectSize.width}
          height={inRectSize.height}
          stroke="none"
          fill="#01bc8c"
          fillOpacity="0.25"
          pointerEvents={events}
          opacity={editorMode === "draw" ? "0" : "1"}
        />
      </svg>

      <ContextRect
        rectSize={inRectSize}
        isBBCreated={isBBCreated}
        mode={editorMode}
        onCancel={() => {
          clearBB();
        }}
        onAddLink={() => {
          setIsImportModalOpen(true);
        }}
        onExport={handleExport}
        onTransFormStarted={handleTransformStart}
        onTransFormEnd={handleTransformEnd}
      />

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

          <div style={{ padding: "3px" }}>
            <ButtonComponent
              type={"primary"}
              onClick={() => {
                window.open("/", "", "");
              }}
            >
              <img
                src={"../icons/add_box-24px.svg"}
                alt={"新規作成"}
                title={"新規作成"}
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
              onClick={() => {
                setIsLocalListModalOpen(true);
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
              //clearBB();
            }}
          />

          <ViewLinkDialog
            isShow={isLinkModalOpen}
            onCancel={() => {
              setIsLinkModalOpen(false);
            }}
            referedIllusts={referredIllusts}
            selfKey={selfKey}
            referIllusts={referIllusts}
            onKeySelected={key => {
              setSelectedItemKey(key);
              setIsThumbOpen(true);
            }}
          />

          <LocalListDialog
            isShow={isLocalListModalOpen}
            localIllustList={localIllustList}
            onCancel={() => {
              setIsLocalListModalOpen(false);
            }}
            onDeleted={handleLocalImageDelete}
            onSelected={() => {}}
          />

          <ThumbDialog
            isShow={isThumbOpen}
            onCancel={() => {
              setSelectedItemKey("");
              setIsThumbOpen(false);
            }}
            selfKey={selfKey}
            sourceKey={selectedItemKey}
          />
        </div>
      </div>
    </>
  );
};
