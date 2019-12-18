import * as React from "react";
import { FC, useRef, useState } from "react";
import { EditorMode, getPoint, Points, Size } from "../share/utils";
import { createPortal } from "react-dom";

type contextRectProps = {
  rectSize: Size;
  mode: EditorMode;
  isBBCreated: boolean;
  onCancel: () => void;
  onAddLink: () => void;
  onExport: () => void;
  onTransFormStarted: (transform: string) => void;
  onTransFormEnd: (transform: string) => void;
};

export const ContextRect: FC<contextRectProps> = props => {
  const {
    rectSize,
    isBBCreated,
    onCancel,
    onAddLink,
    onExport,
    onTransFormStarted,
    onTransFormEnd
  } = props;

  //BBの寸法
  const [bbSize, setBBSize] = useState<Size>(rectSize);

  //ドラッグ中か判別するboolean
  const [isDragging, setIsDragging] = useState<boolean>(false);

  //PointerDownしたときの座標
  const [initialPoint, setInitialPoint] = useState<Points>({ x: 0, y: 0 });

  //キャンバスのRef
  const canvasRef = useRef<SVGSVGElement>(null);
  //BB自体のRef
  const rectRef = useRef<SVGRectElement>(null);

  function dispatchAddLink(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onAddLink();
    //onCancel();
  }

  function dispatchExport(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onExport();
    //onCancel();
  }

  function BBDown(event: React.PointerEvent<SVGRectElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
    const now = getPoint(event.pageX, event.pageY, canvasRef.current);
    setInitialPoint({ x: Math.floor(now.x), y: Math.floor(now.y) });
  }

  function BBMove(event: React.PointerEvent<SVGRectElement>) {
    if (isDragging) {
    }
  }

  function BBUp(event: React.PointerEvent<SVGRectElement>) {
    setInitialPoint(null);
    setIsDragging(false);
  }

  return createPortal(
    isBBCreated && (
      <>
        <section
          className="BBOverLay"
          onClick={onCancel}
          style={{ pointerEvents: isBBCreated ? "auto" : "none" }}
        >
          <svg
            style={{ width: "100%", height: "100%", position: "absolute" }}
            ref={canvasRef}
          >
            <rect
              ref={rectRef}
              x={bbSize.left || rectSize.left}
              y={bbSize.top || rectSize.top}
              width={bbSize.width || rectSize.width}
              height={bbSize.height || rectSize.height}
              style={{ cursor: "move" }}
              stroke="#585858"
              strokeOpacity="0.5"
              strokeWidth="4"
              strokeDasharray="4"
              fill="#01bc8c"
              fillOpacity="0.25"
              onPointerDown={BBDown}
              onPointerMove={BBMove}
              onPointerUp={BBUp}
            />
          </svg>

          <div
            className="contextRectMenu"
            style={{
              left: bbSize.left || rectSize.left,
              bottom: window.innerHeight - (bbSize.top || rectSize.top)
            }}
          >
            <div className="contextRectButtons" onClick={dispatchAddLink}>
              {"他の図とリンク"}
            </div>
            <div className="contextRectButtons" onClick={dispatchExport}>
              {"エキスポート"}
            </div>
          </div>
        </section>
      </>
    ),
    document.body
  );
};
