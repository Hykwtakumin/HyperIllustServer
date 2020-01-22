import * as React from "react";
import { FC } from "react";
import { HyperIllust } from "../../share/model";
import * as ReactDOM from "react-dom";
import { ButtonComponent } from "./share";

type ExportDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  currentItem: HyperIllust;
};

/*画像を共有する際のダイアログ*/
export const ExportDialog: FC<ExportDialogProps> = props => {
  const { isShow, onCancel, currentItem } = props;

  const handlePasteURL = () => {};

  return ReactDOM.createPortal(
    <>
      {isShow && (
        <>
          <section className="overLay" onClick={onCancel}>
            <div className="exportDialogContainer">この画像を共有します</div>
          </section>
        </>
      )}
    </>,
    document.body
  );
};
