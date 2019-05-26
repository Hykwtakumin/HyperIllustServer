import * as React from "react";
import { render } from "react-dom";
import { MainCanvas } from "./components/MainCanvas";

const rootElement = document.getElementById("root");
render(<MainCanvas />, rootElement);
