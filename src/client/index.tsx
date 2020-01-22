import * as React from "react";
import { render } from "react-dom";
import { MainCanvas } from "./components/MainCanvas";
import { ModalProvider } from "./components/share";
import { parseSVGFromString } from "./components/share/SVGParser";
import { HyperIllust } from "../share/model";

//ここらへんの処理を
const rootElement = document.getElementById("root");

const serializedHydratedSVG: string = document
  .getElementById("hydration-data")
  .getAttribute("data-data");

const hydratedMetaData: string = document
  .getElementById("hydration-data")
  .getAttribute("data-meta-data");

//SVG本体を取得する
parseSVGFromString(serializedHydratedSVG)
  .then(result => {
    console.dir(result);

    if (hydratedMetaData) {
      const serializedMeta = JSON.parse(hydratedMetaData) as HyperIllust;
      console.dir(serializedMeta);
      render(
        <ModalProvider>
          <MainCanvas
            loadedStrokes={result.loadedStrokes}
            loadedGroups={result.loadedGroups}
            loadedLinked={serializedMeta.linkedList}
            loadedLinkedBy={serializedMeta.linkedByList}
            loadedImported={serializedMeta.importedList}
            loadedImportedBy={serializedMeta.importedByList}
          />
        </ModalProvider>,
        rootElement
      );
    } else {
      render(
        <ModalProvider>
          <MainCanvas
            loadedStrokes={result.loadedStrokes}
            loadedGroups={result.loadedGroups}
            loadedLinked={result.loadedLinked}
            loadedLinkedBy={result.loadedLinkedBy}
            loadedImported={result.loadedImported}
            loadedImportedBy={result.loadedImportedBy}
          />
        </ModalProvider>,
        rootElement
      );
    }
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
