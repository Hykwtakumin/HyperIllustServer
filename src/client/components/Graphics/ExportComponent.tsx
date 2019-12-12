import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC, useState, useEffect, useRef } from "react";
import { Group, Size, Stroke } from "../share/utils";
import { PathDrawer } from "./PathDrawer";
import { GroupDrawer } from "./GroupDrawer";
import { StrokeDrawer } from "./StrokeDrawer";
/*部分Exportを担当するComponent*/

type exportCanvasProps = {
  rectSize: Size;
  strokes: Stroke[];
  groups: Group[];
};

export const exportCanvas: FC<exportCanvasProps> = props => {
  const { rectSize, strokes, groups } = props;
  const exportCanvasRef = useRef<SVGSVGElement>(null);

  return (
    <div className="exportCanvasContainer">
      <svg
        ref={exportCanvasRef}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width={rectSize.width}
        height={rectSize.height}
        viewBox={`0 0 ${rectSize.width} ${rectSize.height}`}
      >
        <desc
          stroke-data={JSON.stringify(strokes)}
          group-data={JSON.stringify(groups)}
        />
        <StrokeDrawer strokes={strokes} events={"auto"} />
        <GroupDrawer groupElms={groups} events={"auto"} />
      </svg>
    </div>
  );
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
