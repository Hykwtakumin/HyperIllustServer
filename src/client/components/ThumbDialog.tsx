import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC, useEffect, useState } from "react";
import { ButtonComponent } from "./share";
import { HyperIllust } from "../../share/model";
import { Group } from "./share/utils";
import { getRefersAndImports, refersAndImports } from "./share/referController";
import { parseSVGFromURL } from "./share/SVGParser";

type ThumbDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  sourceKey: string;
};

//シンプルなダイアログ用コンポーネント
export const ThumbDialog: FC<ThumbDialogProps> = props => {
  const [referredKeys, setReferredKeys] = useState<string[]>([]);
  const [referKeys, setReferKeys] = useState<string[]>([]);
  const [importedKeys, setImportedKeys] = useState<string[]>([]);
  const [importKeys, setImportKeys] = useState<string[]>([]);

  useEffect(() => {
    if (props.sourceKey) {
      parseSVGFromURL(props.sourceKey).then(result => {
        setReferredKeys(
          result.loadedGroups.map(group => group.href.split("/")[4])
        );
      });

      getRefersAndImports(props.sourceKey).then((list: refersAndImports) => {
        console.dir(list);
        //setReferredKeys(list.referredKeys);
        setReferKeys(list.referKeys);
        setImportedKeys(list.importedKeys);
        setImportKeys(list.importKeys);
      });
    }
  }, [props.sourceKey]);

  return ReactDOM.createPortal(
    <>
      {props.isShow && (
        <>
          <section className="overLay" onClick={props.onCancel}>
            <div className="thumbDialogContainer">
              <div className="thumbnailContainer">
                <a
                  href={`https://draw-wiki.herokuapp.com/${
                    props.sourceKey.split("_")[1]
                  }/${props.sourceKey}`}
                >
                  <img
                    style={{
                      maxWidth: "80%"
                    }}
                    alt={props.sourceKey}
                    title={props.sourceKey}
                    src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${
                      props.sourceKey
                    }`}
                    draggable={false}
                  />
                </a>
              </div>
              <div className="thumbDialogReferredContainer">
                <p>この図が引用している図</p>
                {referredKeys &&
                  referredKeys.map((item, index) => {
                    return (
                      <a
                        href={`https://draw-wiki.herokuapp.com/${
                          item.split("_")[1]
                        }/${item}`}
                        key={index}
                        className="referedItemContainer"
                      >
                        <img
                          className="referedItem"
                          alt={item}
                          title={item}
                          src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${item}`}
                          draggable={false}
                        />
                      </a>
                    );
                  })}
              </div>
              <div className="thumbDialogReferredContainer">
                <p>この図を引用している図</p>
                {referKeys &&
                  referKeys.map((item, index) => {
                    return (
                      <a
                        href={`https://draw-wiki.herokuapp.com/${
                          item.split("_")[1]
                        }/${item}`}
                        key={index}
                        className="referedItemContainer"
                      >
                        <img
                          className="referedItem"
                          alt={item}
                          title={item}
                          src={`https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${item}`}
                          draggable={false}
                        />
                      </a>
                    );
                  })}
              </div>
            </div>
          </section>
        </>
      )}
    </>,
    document.body
  );
};
