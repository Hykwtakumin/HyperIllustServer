import * as React from "react";
import * as ReactDOM from "react-dom";
import { FC, useEffect, useState } from "react";
import { getRefersAndImports, refersAndImports } from "./share/referController";
import { parseSVGFromURL } from "./share/SVGParser";

type ThumbDialogProps = {
  isShow: boolean;
  onCancel: () => void;
  selfKey: string;
  // onSelected: (key: string) => void;
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
                    // onClick={ev => {
                    //   props.onSelected(props.sourceKey);
                    // }}
                    draggable={false}
                  />
                </a>
              </div>
              <div className="thumbDialogReferredContainer">
                {referredKeys &&
                  referredKeys.filter(item => item !== props.selfKey).map((item, index) => {
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
                          // onClick={ev => {
                          //   props.onSelected(props.sourceKey);
                          // }}
                        />
                      </a>
                    );
                  })}
                {referKeys &&
                referKeys.filter(item => item !== props.selfKey).map((item, index) => {
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
                        // onClick={ev => {
                        //   props.onSelected(props.sourceKey);
                        // }}
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
