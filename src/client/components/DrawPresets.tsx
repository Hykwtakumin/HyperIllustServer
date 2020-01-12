import * as React from "react";
import { FC, ReactNode } from "react";
import { DrawPreset } from "./share/utils";

type DrawPresetsProps = {
  preset: DrawPreset;
  onPresetChange: (preset: DrawPreset) => void;
};

export const DrawPresets: FC<DrawPresetsProps> = props => {
  const outerRect = (preset: DrawPreset, inner: ReactNode) => {
    let rect;
    if (preset === props.preset) {
      if (props.preset === "eraser") {
        rect = (
          <>
            <rect
              width="36"
              height="36"
              rx="20"
              ry="20"
              fill="rgba(103,150,148,1)"
            />
            <circle cx="18" cy="18" r="16" fill="rgba(0,0,0,.25)" />
          </>
        );
      } else {
        rect = (
          <>
            <rect
              width="36"
              height="36"
              rx="20"
              ry="20"
              fill="rgba(103,150,148,1)"
            />
            <circle cx="18" cy="18" r="16" fill="#fff" />
          </>
        );
      }
    } else if (preset === "eraser") {
      rect = <rect width="36" height="36" rx="10" ry="10" fill="rgba(0,0,0,.25)" />;
    } else {
      rect = <rect width="36" height="36" rx="10" ry="10" fill="#fff" />;
    }

    return (
      <div
        className="colorPalletButton"
        onClick={() => {
          props.onPresetChange(preset);
        }}
      >
        <svg
          width={"36px"}
          height={"36px"}
          xmlns={"http://www.w3.org/2000/svg"}
        >
          {rect}
          {inner}
        </svg>
      </div>
    );
  };

  return (
    <div className="collorPalletContainer">
      {outerRect("normal", <circle cx="18" cy="18" r="6" fill="#585858" />)}
      {outerRect("bold", <circle cx="18" cy="18" r="10" fill="#585858" />)}
      {outerRect(
        "shadow",
        <circle cx="18" cy="18" r="6" fill="rgba(0,0,0,.25)" />
      )}
      {outerRect(
        "highLight",
        <circle cx="18" cy="18" r="6" fill="rgba(255,141,60,0.8)" />
      )}
      {outerRect(
        "eraser",
        <circle cx="18" cy="18" r="6" fill="#fff" />
      )}
    </div>
  );
};
