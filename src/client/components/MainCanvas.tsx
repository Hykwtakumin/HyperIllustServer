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
import {
  loadHyperIllusts,
  loadIllustsFromUser,
  resetLocalIllusts
} from "./ImportButton";
import { HyperIllust, HyperIllustUser } from "../../share/model";
import {
  deleteObjectFromLocalStorage,
  restoreFromLocalStorage,
  saveToLocalStorage
} from "./share/localStorage";
import { loadUserInfo, setUserInfo } from "./share/UserSetting";
import {
  deleteSVG,
  updateMetaData,
  updateSVG,
  updateUser,
  uploadSVG
} from "./share/API";
import { StrokeDrawer } from "./Graphics/StrokeDrawer";
import { GroupDrawer } from "./Graphics/GroupDrawer";
import { ResetDialog } from "./ResetDialog";
import { DrawPresets } from "./DrawPresets";
import { ImportDialog } from "./ImportDialog";
import { ViewLinkDialog } from "./ViewLinkDialog";
import { LocalListDialog } from "./LocalListDialog";
import { ThumbDialog } from "./ThumbDialog";
import { addLinkedInfo, deleteLinkedInfo } from "./share/referController";
import { ContextRect } from "./Graphics/ContextRect";
import { createGroup } from "./Graphics/GroupController";
import { ShareDialog } from "./ShareDialog";
import {isTouchOk} from "./share/EventHandler";

export type MainCanvasProps = {
  loadedStrokes?: Stroke[];
  loadedGroups?: Group[];
  loadedLinked?: string[];
  loadedLinkedBy?: string[];
  loadedImported?: string[];
  loadedImportedBy?: string[];
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
  const [events, setEvents] = useState<PointerEvents>("auto");
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

  //タッチによる描画を許可するか否か
  const [allowTouch, setAllowTouch] = useState<boolean>(false);

  //共有モーダルの表示
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);

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
  const [localIllustList, setLocalIllustList] = useState<HyperIllust[]>([]);

  //引用したHyperIllustのリスト
  const [linkedList, setLinkedList] = useState<string[]>(
    props.loadedLinked || []
  );
  //自分を引用しているHyperIllustのリスト
  const [linkedByList, setLinkedByList] = useState<string[]>(
    props.loadedLinkedBy || []
  );

  //インポートした画像のリスト
  const [importedList, setImportedList] = useState<string[]>(
    props.loadedImported || []
  );
  //自分をインポートしている画像のリスト
  const [importedByList, setImportedByList] = useState<string[]>(
    props.loadedImportedBy || []
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
  //普通に毎回入力させるようにすれば良いのでは?
  //自動登録や自動保存はやめる?
  //何も入力していない場合は自動でリダイレクトされる
  useEffect(() => {
    const user = loadUserInfo();
    if (user) {
      /*設定されている*/
      setUser(user);
      if (location.href.split("/")[3] !== user.name) {
        //これは他のユーザーのギャラリーにアクセスしたということなのでなんとかする
        //window.history.replaceState(null, null, `/${user.name}`);
        const otherUser = location.href.split("/")[3];
        //resetLocalIllusts();
        const loadedList = loadIllustsFromUser(otherUser);
        setLocalIllustList(loadedList);
      } else {
        //localイラストをロードする
        //loadHyperIllusts();
        //resetLocalIllusts();
        //resetLocalIllusts();
        const loadedList = loadIllustsFromUser(user.name);
        setLocalIllustList(loadedList);
      }
    } else {
      /*設定されていない*/
      setUserInfo();
      const newUser = loadUserInfo();
      if (newUser) {
        setUser(newUser);
        const loadedList = loadIllustsFromUser(newUser.name);
        setLocalIllustList(loadedList);
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
    } else if (preset === "eraser") {
      setPenWidth(5);
      setColor("rgba(255,255,255,1)");
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
    setLinkedList(
      groups.reduce((prev, curr, index) => {
        if (curr.href) {
          prev.push(curr.href);
        }
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

  //グループの中のURLをトラバースするのではなく、

  //選択されたGroup要素が変わる度にサムネイル用ツールチップを表示する
  useEffect(() => {
    if (selectedGroup) {
      console.log(`現在次のグループが選択されています。: ${selectedGroup.id}`);
      if (selectedGroup.href) {
        const key = selectedGroup.href.split("/")[4];
        console.log(`そしてそのKeyは${key}です。`);
        setSelectedItemKey(key);
        setIsThumbOpen(true);
      }
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

    if (editorMode === "draw" && isTouchOk(event.pointerType, allowTouch)) {
      const newPoint: drawPoint = {
        x: Math.floor(now.x),
        y: Math.floor(now.y)
      };

      setPoints([...points, newPoint]);
    } else {
      //編集モードのときはBBやパスの操作ということにする
      handleBBDown(event);
    }
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
      if (editorMode === "draw" && isTouchOk(event.pointerType, allowTouch)) {
        const now = getPoint(event.pageX, event.pageY, canvasRef.current);
        const newPoint: drawPoint = {
          x: Math.floor(now.x),
          y: Math.floor(now.y)
        };
        setPoints([...points, newPoint]);

        const strokeDrawer = document.getElementById("strokeDrawer");
        // if (strokeDrawer) {
        //   const drawingRect = strokeDrawer.getBoundingClientRect();
        //   if (drawingRect.height > 5 || drawingRect.width > 5) {
        //     timerId.current && clearTimeout(timerId.current);
        //   }
        // }
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
  };

  const handleUp = (event: React.PointerEvent<SVGSVGElement>) => {
    console.log("onPointerUp!");
    setIsDragging(false);
    if (editorMode === "draw" && isTouchOk(event.pointerType, allowTouch)) {
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
    if (!selfKey) {
      console.log("新規作成");
      //アップロードする
      console.dir(user);
      const result = await uploadSVG(canvasRef.current, user.name);

      console.log("result");
      console.dir(result);

      //再設定
      //setLocalIllustList(loadHyperIllusts());
      setLocalIllustList([...localIllustList, result]);
      //itemURLを設定
      setSelfKey(result.id);
      //URLを変更する
      window.history.replaceState(null, null, `/${user.name}/${result.id}`);
      //ここでやるべきことは
      //ユーザーメタデータに新規イラストIDを追加する
      if (user.illustList && !user.illustList.includes(result.id)) {
        user.illustList.push(result.id);
        updateUser(user.name, user).then(result => {
          saveToLocalStorage<HyperIllustUser>(`draw-wiki-user`, user);
        });
      }
    } else {
      //既にSVGはあるので上書きさせる
      console.log(`上書き: ${selfKey}`);
      //インポートした画像をここで打ち込む
      //ここでやるべきことは、
      //localListの更新?(updatedAt)
      //メタデータのアップロード

      const result = await updateSVG(canvasRef.current, selfKey);

      if (result) {
        //アップロード時に全てをかえるか
        //useEffectで全てを制御するか
        //それが問題である
        const updateTarget = localIllustList.find(item => item.id == selfKey);
        if (updateTarget) {
          updateTarget.linkedList = linkedList;
          updateTarget.linkedByList = linkedByList;
          updateTarget.importedList = importedList;
          updateTarget.importedByList = importedByList;
          updateTarget.updatedAt = new Date().toISOString();
          updateMetaData(updateTarget.id, updateTarget).then(result => {
            if (result) {
              console.log("メタデータの更新に成功しました!");
              console.dir(result);
              //localIllustListも更新するべきだろうか?
            }
          });
        }
      } else {
        console.log("アップロードに問題が発生しました");
      }
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
  //本当は依存関係もクリアーしなきゃいけない
  const handleLocalImageDelete = async (item: HyperIllust) => {
    console.dir(item);
    //本体SVGを削除
    const request = await deleteSVG(item.sourceKey);
    //メタデータを削除
    const request2 = await deleteSVG(item.id);
    //ユーザーメタデータの方も更新
    if (user.illustList.includes(item.id)) {
      user.illustList = user.illustList.filter(id => id !== item.id);
      updateUser(user.name, user);
    }
    //localListを更新
    setLocalIllustList(
      localIllustList.filter(illust => {
        if (illust.sourceKey != item.sourceKey) {
          return illust;
        }
      })
    );
  };

  //変形(移動やリサイズを扱う関数)
  const handleTransformStart = (transform: string) => {
    if (selectedGroup) {
      //既にあるGroupを変形させる
      setGroups(
        groups.reduce((prev, curr) => {
          if (selectedGroup.id === curr.id) {
            curr.transform = transform;
            prev.push(curr);
          } else {
            prev.push(curr);
          }
          return prev;
        }, [])
      );
    } else {
      //新規作成
      const newGroup = createGroup(selectedElms, strokes, ``, transform);

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
    handleTransformStart(transform);
    // if (selectedGroup) {
    // } else {
    // }
  };

  const handleExport = () => {
    window.alert("まだ未実装の機能です!m(_ _)m");
  };

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
      //引用情報を追加する
      console.dir(item);
      addRefer(item.id);
    } else {
      console.log("要素が選択されていません");
    }
  };

  //referを操作する関数
  //addLinkとかhandleImportとかで使う
  const addRefer = async (itemKey: string) => {
    //まず自分の引用リストに追加する
    setLinkedList([...linkedList, itemKey]);
    //次に引用したモノのリストにも自分のIDを追加する
    await addLinkedInfo(selfKey, itemKey);
  };

  const deleteRefer = async (itemKey: string) => {
    //自分の引用リストから削除
    setLinkedList(linkedList.filter(item => item !== itemKey));
    //次に引用したモノのリストにも自分のIDを追加する
    await deleteLinkedInfo(selfKey, itemKey);
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
          referred-data={JSON.stringify(linkedList)}
          refer-data={JSON.stringify(linkedByList)}
          imported-data={JSON.stringify(importedList)}
          import-data={JSON.stringify(importedByList)}
        />
        <defs />
        <rect width="100%" height="100%" fill="#FFFFFF" />
        <StrokeDrawer strokes={strokes} events={events} />
        <GroupDrawer
          groupElms={groups}
          events={events}
          mode={editorMode}
          selectedGroup={selectedGroup}
          onGroupSelected={setSelectedGroup}
        />
        <PathDrawer points={points} color={color} width={`${penWidth}`} />
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
          opacity={editorMode === "draw" || isBBCreated ? "0" : "1"}
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
        // onTransFormStarted={handleTransformStart}
        // onTransFormEnd={handleTransformEnd}
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
                const url = user ? `/${user.name}` : `/`;
                window.open(url, "", "");
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
                //setIsShareDialogOpen(true);
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

          <div style={{ padding: "3px" }}>
            <img  src={"../icons/touch_app-24px.svg"} draggable={false}  />
            <input type={"checkbox"} onChange={event => {
              setAllowTouch(event.target.checked)
            }} />
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
            selfKey={selfKey}
            linkedKeys={linkedList}
            linkedByKes={linkedByList}
            onKeySelected={key => {
              setSelectedItemKey(key);
              setIsThumbOpen(true);
            }}
          />

          <LocalListDialog
            isShow={isLocalListModalOpen}
            localIllustList={localIllustList}
            userName={user ? user.name : ""}
            onCancel={() => {
              setIsLocalListModalOpen(false);
            }}
            onDeleted={handleLocalImageDelete}
            onSelected={() => {}}
          />

          <ShareDialog
            isShow={isShareDialogOpen}
            itemKey={selfKey}
            onCancel={() => {
              setIsShareDialogOpen(false);
            }}
          />

          <ThumbDialog
            isShow={isThumbOpen}
            onCancel={() => {
              setSelectedItemKey("");
              setIsThumbOpen(false);
            }}
            userName={user ? user.name : ""}
            selfKey={selfKey}
            sourceKey={selectedItemKey}
          />
        </div>
      </div>
    </>
  );
};
