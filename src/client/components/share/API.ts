//アップロードするSVGを作る
import { HyperIllust } from "../../../share/model";

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
  const opt = {
    method: "POST",
    body: formDataCreator(svg)
  };
  try {
    const request = await fetch(`/api/upload/${userName}`, opt);
    return (await request.json()) as HyperIllust;
  } catch (error) {
    console.log(error);
    return error;
  }
};

//SVGの更新用
export const updateSVG = async (svg: SVGElement, fileKey: string) => {
  const opt = {
    method: "POST",
    body: formDataCreator(svg)
  };
  try {
    const request = await fetch(`/api/update/${fileKey}`, opt);
    return (await request.json()) as HyperIllust;
  } catch (error) {
    console.log(error);
    return error;
  }
};

//SVGの取得用
//インポートとかに使う
export const getSVG = async () => {};

//Socket接続
