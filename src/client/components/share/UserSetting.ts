import { saveToLocalStorage, restoreFromLocalStorage } from "./localStorage";
import { HyperIllustUser } from "../../../share/model";

//いずれちゃんとしたUserをつくる
//とりあえずで良い

//一度設定したユーザー情報を復元する
export function loadUserInfo(): HyperIllustUser {
  if (window.localStorage) {
    for (let key in localStorage) {
      if (key && key.includes("draw-wiki-user")) {
        const restoredUser = JSON.parse(
          localStorage.getItem(key)
        ) as HyperIllustUser;
        return restoredUser;
      }
    }
  }
}

//まだUserが決まっていない状態(初回アクセス時)
export async function setUserInfo() {
  if (window.localStorage) {
    const userName = location.href.split("/")[3];
    const now = new Date();
    const setUser: HyperIllustUser = {
      id: userName,
      name: userName,
      createdAt: now,
      updatedAt: now
    };
    await saveToLocalStorage<HyperIllustUser>(`draw-wiki-user`, setUser);
  }
}
