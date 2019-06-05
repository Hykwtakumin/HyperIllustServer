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
import { ImportPotal } from "./ImportPotal";
import * as moment from "moment";

interface MainCanvasProps {}

export const MainCanvas = (): FC<MainCanvasProps> => {
  // Declare a new state variable, which we'll call "count"
  const [lastpath, setLastPath] = useState({ null: SVGElement });
  const [penWidth, setPenWidth] = useState(6);
  const [color, setColor] = useState("#585858");
  const [editorMode, setEditorMode] = useState("draw");
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight * 0.6
  });

  let isDragging: boolean = false;
  let lastPath;
  const svgCanvas = useRef(null);

  /*on Canvas Resize*/
  window.onresize = () => {
    setCanvasSize({
      width: window.innerWidth,
      height: window.innerHeight * 0.6
    });
  };

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
    setEditorMode(event.target.value);
  };

  const handleDown = (event: React.SyntheticEvent<HTMLElement>) => {
    event.persist();
    isDragging = true;
    const canvas = svgCanvas.current;
    const point: Points = getPoint(event.pageX, event.pageY, canvas);
    lastPath = addPath(canvas, point);
    lastPath.setAttribute("stroke", color);
    lastPath.setAttribute("stroke-width", `${penWidth}`);
    lastPath.classList.add("current-path");
    console.dir(lastPath);
  };

  const handleMove = (event: React.SyntheticEvent<HTMLElement>) => {
    //event.persist();
    if (isDragging) {
      if (lastPath) {
        const canvas = svgCanvas.current;
        const point: Points = getPoint(event.pageX, event.pageY, canvas);
        updatePath(lastPath, point);
        console.dir(lastPath);
      } else {
        console.log("something went wrong");
      }
    }
  };

  const handleUp = (event: React.SyntheticEvent<HTMLElement>) => {
    //event.persist();
    isDragging = false;
    lastPath.classList.remove("current-path");
    lastPath = null;
  };

  const handleUpload = () => {
    //const now = moment().format("YYYY-MM-DD-HH-mm-ss");
    //const fileName = `hyperillust_${now}_.svg`;
    const uploadObject = new XMLSerializer().serializeToString(
      svgCanvas.current
    );

    const blobObject: Blob = new Blob(
      [new XMLSerializer().serializeToString(svgCanvas.current)],
      { type: "image/svg+xml;charset=utf-8" }
    );

    const uploadBody = {
      title: `hyperIllust.svg`,
      body: blobObject
    };
    const formData = new FormData();
    formData.append(`file`, blobObject);

    const opt = {
      method: "POST",
      body: formData
    };
    fetch(`/api/upload`, opt)
      .then(res => {
        console.dir(res);
        res
          .json()
          .then(data => console.log)
          .catch(e => console.log);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <React.Fragment>
      <div className={"toolBar"}>
        <PenWidthSelector widthChange={onWidthChange} />
        <ColorPicker colorChange={onColorChange} />
        <ModeSelector modeChange={onModeChange} />
        <ImportPotal modalSubmit={console.log} />

        <span>100%</span>

        <input
          type={"button"}
          value={"Download"}
          className={"button toolButton"}
        />

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
          viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
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
    </React.Fragment>
  );
};
