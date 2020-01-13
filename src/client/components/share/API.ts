//アップロードするSVGを作る
import { HyperIllust, HyperIllustUser } from "../../../share/model";
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

export const jsonFormDataConvertor = (json: string) => {
  const blobObject: Blob = new Blob([json], { type: "application/json" });
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

//メタデータのダウンロード
export const loadMetaData = async (key: string): Promise<HyperIllust> => {
  const request = await fetch(
    `https://s3.us-west-1.amazonaws.com/hyper-illust-creator/${key}`
  );
  return await request.json();
};

//メタデータのアップロード用
export const uploadMetaData = async (
  key: string,
  meta: HyperIllust
): Promise<HyperIllust> => {
  const options = {
    method: "POST",
    body: jsonFormDataConvertor(JSON.stringify(meta))
  };

  const request = await fetch(`/api/updatemeta/${key}`);

  if (request) {
    return (await request.json()) as HyperIllust;
  }
};

//メタデータの更新用
export const updateMetaData = async (
  key: string,
  meta: HyperIllust
): Promise<HyperIllust> => {
  const options = {
    method: "POST",
    body: jsonFormDataConvertor(JSON.stringify(meta))
  };

  const request = await fetch(`/api/updatemeta/${key}`, options);

  if (request) {
    return (await request.json()) as HyperIllust;
  }
};

//メタデータの削除用

//ユーザーを新規登録する関数
export const registerUser = async (key: string, userData: HyperIllustUser) => {
  const options = {
    method: "POST",
    body: jsonFormDataConvertor(JSON.stringify(userData))
  };
  const request = await fetch(`/api/createuser/${key}`, options);
  if (request) {
    return await request.json();
  }
};

//既存ユーザーを取得する関数
export const getUser = async (key: string): Promise<HyperIllustUser> => {
  const request = await fetch(`/api/getuser/${key}`);
  if (request) {
    return await request.json();
  }
};

//ユーザー情報を更新する関数
export const updateUser = async (key: string, userData: HyperIllustUser) => {
  const options = {
    method: "POST",
    body: jsonFormDataConvertor(JSON.stringify(userData))
  };
  const request = await fetch(`/api/updateuser/${key}`, options);
  if (request) {
    return await request.json();
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
  const request = await fetch(`/api/delete/${encodeURI(fileKey)}`, options);
  const result = await request.json();
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
