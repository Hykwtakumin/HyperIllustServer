//アップロードするSVGを作る
import { HyperIllust } from "../../../share/model";
import { Group, Stroke } from "./utils";

export const formDataCreator = (svg: SVGElement): FormData => {
  const blobObject: Blob = new Blob(
    [new XMLSerializer().serializeToString(svg)],
    { type: "image/svg+xml;charset=utf-8" }
  );
  const formData = new FormData();
  formData.append(`file`, blobObject);
  return formData;
};

//SVGのアップロード用
export const uploadSVG = async (
  svg: SVGElement,
  userName: string
): Promise<HyperIllust> => {
  const options = {
    method: "POST",
    body: formDataCreator(svg)
  };
  try {
    const request = await fetch(`/api/upload/${userName}`, options);
    return (await request.json()) as HyperIllust;
  } catch (error) {
    console.log(error);
    return error;
  }
};

//SVGの更新用
export const updateSVG = async (svg: SVGElement, fileKey: string) => {
  const options = {
    method: "PUT",
    body: formDataCreator(svg)
  };
  try {
    const request = await fetch(`/api/update/${encodeURI(fileKey)}`, options);
    return (await request.json()) as HyperIllust;
  } catch (error) {
    console.log(error);
    return error;
  }
};

//SVGの削除用
export const deleteSVG = async (fileKey: string) => {
  const options = {
    method: "DELETE"
  };

  let result;
  const request = await fetch(`/api/delete/${encodeURI(fileKey)}`, options);
  result = await request.json();
  if (result) {
    console.log(result);
    return true;
  } else {
    return false;
  }
};

//StrokeとGroupsをアップロードする
export const uploadStrokes = async (
  width: number,
  height: number,
  strokes: Stroke[],
  groups: Group[]
) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      width: width,
      height: height,
      stroke: strokes,
      group: groups
    })
  };

  const request = await fetch(`/api/ssr`, options);

  if (request) {
    console.dir(request);
    return await request.json();
  } else {
    console.log("error");
    return false;
  }
};

//SVGの取得用
//インポートとかに使う
export const getSVG = async () => {};

//Socket接続
