import { Group, Stroke } from "../share/utils";
//グループ化の処理はややこしいのでわけた

//新規グループを作成する関数
export function createGroup(
  selectedElms: string[],
  strokes: Stroke[],
  href?: string,
  transform?: string
): Group {
  const selectedStrokes = strokes.reduce((prev, curr) => {
    if (selectedElms.includes(curr.id)) {
      curr.isSelected = false;
      prev.push(curr);
    }
    return prev;
  }, []);

  const newGroup: Group = {
    id: `${Date.now()}`,
    href: href || "",
    strokes: selectedStrokes,
    transform: transform || ""
  };

  return newGroup;
}

//選択されたPathが既にグループに属しているか判断する関数
export function detectGroup(selectedElms: string[]) {
  //もしグループを選択していた場合
  //
}
