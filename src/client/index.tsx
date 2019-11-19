import * as React from "react";
import { render } from "react-dom";
import { MainCanvas } from "./components/MainCanvas";
import { ModalProvider } from "./components/share";

const rootElement = document.getElementById("root");
render(
  <ModalProvider>
    <MainCanvas />
  </ModalProvider>,
  rootElement
);
