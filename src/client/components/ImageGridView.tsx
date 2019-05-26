import * as React from "react";
import { titleImageMap } from "./utils";

interface ImageGridProps {
  titleImageMap: titleImageMap[];
  imageSelected: (map: titleImageMap) => void;
}

export const ImageGrid = (props: ImageGridProps) => {
  const onImageSelected = () => {};
  return (
    <React.Fragment>
      <div />
    </React.Fragment>
  );
};
