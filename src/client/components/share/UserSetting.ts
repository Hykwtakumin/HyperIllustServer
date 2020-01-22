import { saveToLocalStorage, restoreFromLocalStorage } from "./localStorage";
import { HyperIllustUser } from "../../../share/model";
import { getUser, registerUser } from "./API";

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

//ネットワーク経由でイラストリストを取得する処理も含める

//まだUserが決まっていない状態(初回アクセス時)
export async function setUserInfo() {
  if (window.localStorage) {
    const userName = location.href.split("/")[3];
    const now = new Date();
    const setUser: HyperIllustUser = {
      id: userName,
      name: userName,
      illustList: [],
      createdAt: now,
      updatedAt: now
    };
    //登録も行う
    //まず既存のUserが無いかどうかチェックする
    const check = await getUser(userName);
    if (!check) {
      //ない場合だけ登録する
      const request = await registerUser(userName, setUser);
      console.dir(request);
      await saveToLocalStorage<HyperIllustUser>(`draw-wiki-user`, setUser);
    } else {
      //ある場合はロードしてくる
      await saveToLocalStorage<HyperIllustUser>(`draw-wiki-user`, check);
    }
  }
}
