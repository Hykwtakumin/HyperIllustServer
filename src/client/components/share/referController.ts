import { HyperIllust } from "../../../share/model";
import { restoreFromLocalStorage, saveToLocalStorage } from "./localStorage";
/*HyperIllustには引用・被引用関係が定義されている。そのアタリをよしなにする関数*/
/*自分が引用orImportしている画像を配列として持たせる*/
/*自分を引用orImportしている画像も配列として持たせる*/

export type refersAndImports = {
  referredKeys: string[];
  referKeys: string[];
  importedKeys: string[];
  importKeys: string[];
};

export const defineReferToIllust = (
  illust: HyperIllust,
  refKeys: string[]
): HyperIllust => {
  //まず引用関係を定義する
  const previousKeys = [];
  if (illust.referredIllusts) {
    previousKeys.push([...illust.referredIllusts]);
    illust.referredIllusts = refKeys;
  } else {
    // Object.defineProperty(illust, "referIllusts", {
    //   value: refKeys,
    //   writable: true
    // });
    illust.referredIllusts = refKeys;
  }
  //被引用関係が消失したイラストも更新
  if (previousKeys.length > 0) {
    deleteReferInfo(previousKeys, illust.id);
  }
  //引用されたイラスト全てに被引用情報を追加
  updateReferInfo(refKeys, illust.id);
  return illust;
};

//被引用情報を追加する関数
export const updateReferInfo = (refKeys: string[], referedKey: string) => {
  refKeys.forEach(async refKey => {
    //当該イラストを取得
    if (refKey) {
      console.log(`${refKey}の引用情報を追加中...`);
      const updating = await restoreFromLocalStorage<HyperIllust>(refKey);
      if (updating.referIllusts) {
        console.log(`引用情報を追加します`);
        //重複がなければ追加する
        if (!updating.referIllusts.includes(referedKey)) {
          updating.referIllusts = [...updating.referIllusts, referedKey];
          console.log(`引用情報を追加しました!`);
          console.dir(updating);
          await saveToLocalStorage<HyperIllust>(refKey, updating);
        }
      } else {
        console.log(`新規作成します。`);
        // await saveToLocalStorage<HyperIllust>(refKey,Object.defineProperty(updating, "referIllusts", {
        //   value: [referedKey],
        //   writable: true
        // }));
        updating.referIllusts = [referedKey];
        await saveToLocalStorage<HyperIllust>(refKey, updating);
        console.dir(await restoreFromLocalStorage<HyperIllust>(refKey));
      }
    }
  });
};

//不要になった被引用情報を削除する関数
export const deleteReferInfo = (prevKeys: string[], referedKey: string) => {
  prevKeys.forEach(async prevKey => {
    if (prevKey) {
      //当該イラストを取得
      const updating = await restoreFromLocalStorage<HyperIllust>(prevKey);
      console.log(`${prevKey}の引用情報を編集中...`);
      if (updating.referIllusts && updating.referIllusts.includes(referedKey)) {
        console.log(`${prevKey}の引用情報を削除します`);
        updating.referIllusts = updating.referIllusts.filter(
          key => key !== referedKey
        );
        await saveToLocalStorage<HyperIllust>(prevKey, updating);
        console.dir(updating);
        //console.log(`引用情報を削除しました! 対象${prevKey}, 引用していたもの${referedKey}`);
      }
    }
  });
};

export const defineImportToIllust = (
  illust: HyperIllust,
  importKeys: string[]
): HyperIllust => {
  //まず引用関係を定義する
  const previousKeys = [];
  if (illust.importedIllsts) {
    previousKeys.push([...illust.importedIllsts]);
    illust.importedIllsts = importKeys;
  } else {
    Object.defineProperty(illust, "importedIllsts", {
      value: importKeys,
      writable: true
    });
  }
  //引用されたイラスト全てに被引用情報を追加
  updateImportInfo(importKeys, illust.id);
  //被引用関係が消失したイラストも更新
  if (previousKeys.length > 0) {
    deleteImportInfo(previousKeys, illust.id);
  }
  return illust;
};

//被インポート情報を追加する関数
export const updateImportInfo = (importKeys: string[], importedKey: string) => {
  importKeys.forEach(async refKey => {
    if (refKey) {
      //当該イラストを取得
      const updating = await restoreFromLocalStorage<HyperIllust>(refKey);
      if (updating.importIllusts) {
        //重複がなければ追加する
        if (!updating.importIllusts.includes(importedKey)) {
          updating.importIllusts = [...updating.importIllusts, importedKey];
          await saveToLocalStorage<HyperIllust>(refKey, updating);
        }
      } else {
        Object.defineProperty(updating, "importIllusts", {
          value: [importedKey],
          writable: true
        });
        updating.importIllusts = [importedKey];
        await saveToLocalStorage<HyperIllust>(refKey, updating);
      }
    }
  });
};

//不要になった被インポート情報を削除する関数
export const deleteImportInfo = (prevKeys: string[], referedKey: string) => {
  prevKeys.forEach(async prevKey => {
    if (prevKey) {
      //当該イラストを取得
      const updating = await restoreFromLocalStorage<HyperIllust>(prevKey);
      if (updating.importIllusts && updating.importIllusts.includes(referedKey)) {
        updating.importIllusts = updating.importIllusts.filter(
          key => key !== referedKey
        );
        await saveToLocalStorage<HyperIllust>(prevKey, updating);
        //console.log(`インポート情報を削除しました! 対象${prevKey}, インポートしていたもの${referedKey}`);
      }
    }
  });
};
//引用情報やインポート情報をまとめて取得する関数
//なんかちゃんと動いていない
export const getRefersAndImports = async (
  key: string
): Promise<refersAndImports> => {
  const target = await restoreFromLocalStorage<HyperIllust>(key);
  return {
    referredKeys: target.referredIllusts || [],
    referKeys: target.referIllusts || [],
    importedKeys: target.importedIllsts || [],
    importKeys: target.importIllusts || []
  };
};
