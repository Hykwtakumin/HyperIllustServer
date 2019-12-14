import * as React from "react";
import { render } from "react-dom";
import { MainCanvas } from "./components/MainCanvas";
import { ModalProvider } from "./components/share";
import { parseSVGFromString } from "./components/share/SVGParser";

//ここらへんの処理を
const rootElement = document.getElementById("root");

const serializedHydratedSVG: string = document
  .getElementById("hydration-data")
  .getAttribute("data-data");

parseSVGFromString(serializedHydratedSVG)
  .then(result => {
    console.dir(result);
    render(
      <ModalProvider>
        <MainCanvas
          loadedStrokes={result.loadedStrokes}
          loadedGroups={result.loadedGroups}
          loadedReferred={result.loadedReferred}
          loadedRefer={result.loadedRefer}
          loadedImported={result.loadedImported}
          loadedImport={result.loadedImport}
        />
      </ModalProvider>,
      rootElement
    );
  })
  .catch(error => {
    console.log(error);
    render(
      <>
        <h1>Something Went Wrong!</h1>
      </>,
      rootElement
    );
  });
