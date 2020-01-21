import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC, useEffect, useState } from "react";
import { loadMetaData } from "./share/API";

type ThumbDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  selfKey: string;
  userName: string;
  // onSelected: (key: string) => void;
  sourceKey: string;
};

//シンプルなダイアログ用コンポーネント
export const ThumbDialog: FC<ThumbDialogProps> = props => {
  const { isShow, onCancel, sourceKey, selfKey, userName } = props;

  const [linkedKeys, setLinkedKeys] = useState<string[]>([]);
  const [linkedByKeys, setLinkedByKeys] = useState<string[]>([]);
  const [importedKeys, setImportedKeys] = useState<string[]>([]);
  const [importedByKeys, setImportedByKeys] = useState<string[]>([]);

  useEffect(() => {
    if (isShow && sourceKey) {
      loadMetaData(props.sourceKey).then(result => {
        if (result) {
          setLinkedKeys(result.linkedList);
          setLinkedByKeys(result.linkedByList);
          setImportedKeys(result.importedList);
          setImportedByKeys(result.importedByList);
        }
      });
    }
  }, [sourceKey]);

  return ReactDOM.createPortal(
    <>
      {isShow && (
        <>
          <section className="overLay" onClick={props.onCancel}>
            <div className="thumbDialogContainer">
              <div className="thumbDialogReferredContainer">
                {linkedKeys &&
                  linkedKeys
                    .filter(item => item !== selfKey)
                    .map((item, index) => {
                      return (
                        <a
                          href={`/${userName}/${item}`}
                          key={index}
                          className="linkedItemContainer"
                        >
                          <div key={index} className="linkedItemContainer">
                            <img
                              className="linkedItem"
                              alt={item}
                              title={item}
                              src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${item}.svg`}
                              draggable={false}
                              // onClick={ev => {
                              //   props.onSelected(props.sourceKey);
                              // }}
                            />
                          </div>
                        </a>
                      );
                    })}
                {linkedByKeys &&
                  linkedByKeys
                    .filter(item => item !== selfKey)
                    .map((item, index) => {
                      return (
                        <a
                          href={`/${userName}/${item}`}
                          key={index}
                        >
                          <div key={index} className="linkedItemContainer">
                            <img
                              className="linkedItem"
                              alt={item}
                              title={item}
                              src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${item}.svg`}
                              draggable={false}
                              // onClick={ev => {
                              //   props.onSelected(props.sourceKey);
                              // }}
                            />
                          </div>
                        </a>
                      );
                    })}
              </div>

              <div className="thumbnailContainer">
                <a href={`/${userName}/${sourceKey}`}
                >
                  <img
                    style={{
                      maxWidth: "100%"
                    }}
                    alt={sourceKey}
                    title={sourceKey}
                    src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${sourceKey}.svg`}
                    // onClick={ev => {
                    //   props.onSelected(props.sourceKey);
                    // }}
                    draggable={false}
                  />
                </a>
              </div>
            </div>
          </section>
        </>
      )}
    </>,
    document.body
  );
};
