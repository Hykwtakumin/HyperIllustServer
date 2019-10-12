import * as React from "react";
import { useState, useRef, FC, useEffect } from "react";
import { createPortal } from "react-dom";

export interface PublishModalProps {
  onNameEntered: (name: string) => void;
}

export const PublishModal = () => {
  return createPortal(
    <div>
      <h1>This is Publish Modal</h1>
    </div>,
    document.getElementById("root")
  );
};
