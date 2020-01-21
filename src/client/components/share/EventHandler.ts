/*将来的に複雑なイベント処理系はこっちでやりたい*/

import {PointerEvents} from "./utils";

export type PointerType = "mouse" | "pen" | "touch"

export const isTouchOk = (pointerType: PointerType, allowTouch: boolean): boolean => {
  if (allowTouch) {
    return true
  } else {
    return pointerType !== "touch"
  }
};
