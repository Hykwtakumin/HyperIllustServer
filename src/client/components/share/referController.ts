import { HyperIllust } from "../../../share/model";
import { restoreFromLocalStorage, saveToLocalStorage } from "./localStorage";
import {loadMetaData, updateMetaData} from "./API";
/*HyperIllustには引用・被引用関係が定義されている。そのアタリをよしなにする関数*/
/*自分が引用orImportしている画像を配列として持たせる*/
/*自分を引用orImportしている画像も配列として持たせる*/

export type refersAndImports = {
  referredKeys: string[];
  referKeys: string[];
  importedKeys: string[];
  importKeys: string[];
};

// export const defineReferToIllust = (
//   illust: HyperIllust,
//   refKeys: string[]
// ): HyperIllust => {
//   //まず引用関係を定義する
//   const previousKeys = [];
//   if (illust.linkedList) {
//     previousKeys.push([...illust.linkedList]);
//     illust.linkedList = refKeys;
//   } else {
//     // Object.defineProperty(illust, "referIllusts", {
//     //   value: refKeys,
//     //   writable: true
//     // });
//     illust.linkedList = refKeys;
//   }
//   //被引用関係が消失したイラストも更新
//   if (previousKeys.length > 0) {
//     deleteReferInfo(previousKeys, illust.id);
//   }
//   //引用されたイラスト全てに被引用情報を追加
//   updateReferInfo(refKeys, illust.id);
//   return illust;
// };

//被引用情報を追加する関数
// export const updateReferInfo = (refKeys: string[], referedKey: string) => {
//   refKeys.forEach(async refKey => {
//     //当該イラストを取得
//     if (refKey) {
//       console.log(`${refKey}の引用情報を追加中...`);
//       const updating = await restoreFromLocalStorage<HyperIllust>(refKey);
//       if (updating.linkedByList) {
//         console.log(`引用情報を追加します`);
//         //重複がなければ追加する
//         if (!updating.linkedByList.includes(referedKey)) {
//           updating.linkedByList = [...updating.linkedByList, referedKey];
//           console.log(`引用情報を追加しました!`);
//           console.dir(updating);
//           await saveToLocalStorage<HyperIllust>(refKey, updating);
//         }
//       } else {
//         console.log(`新規作成します。`);
//         // await saveToLocalStorage<HyperIllust>(refKey,Object.defineProperty(updating, "referIllusts", {
//         //   value: [referedKey],
//         //   writable: true
//         // }));
//         updating.linkedByList = [referedKey];
//         await saveToLocalStorage<HyperIllust>(refKey, updating);
//         console.dir(await restoreFromLocalStorage<HyperIllust>(refKey));
//       }
//     }
//   });
// };

//不要になった被引用情報を削除する関数
// export const deleteReferInfo = (prevKeys: string[], referedKey: string) => {
//   prevKeys.forEach(async prevKey => {
//     if (prevKey) {
//       //当該イラストを取得
//       const updating = await restoreFromLocalStorage<HyperIllust>(prevKey);
//       console.log(`${prevKey}の引用情報を編集中...`);
//       if (
//         updating &&
//         updating.linkedByList &&
//         updating.linkedByList.includes(referedKey)
//       ) {
//         console.log(`${prevKey}の引用情報を削除します`);
//         updating.linkedByList = updating.linkedByList.filter(
//           key => key !== referedKey
//         );
//         await saveToLocalStorage<HyperIllust>(prevKey, updating);
//         console.dir(updating);
//         //console.log(`引用情報を削除しました! 対象${prevKey}, 引用していたもの${referedKey}`);
//       }
//     }
//   });
// };

// export const defineImportToIllust = (
//   illust: HyperIllust,
//   importKeys: string[]
// ): HyperIllust => {
//   //まず引用関係を定義する
//   const previousKeys = [];
//   if (illust.importedList) {
//     previousKeys.push([...illust.importedList]);
//     illust.importedList = importKeys;
//   } else {
//     Object.defineProperty(illust, "importedIllsts", {
//       value: importKeys,
//       writable: true
//     });
//   }
//   //引用されたイラスト全てに被引用情報を追加
//   updateImportInfo(importKeys, illust.id);
//   //被引用関係が消失したイラストも更新
//   if (previousKeys.length > 0) {
//     deleteImportInfo(previousKeys, illust.id);
//   }
//   return illust;
// };

// //被インポート情報を追加する関数
// export const updateImportInfo = (importKeys: string[], importedKey: string) => {
//   importKeys.forEach(async refKey => {
//     if (refKey) {
//       //当該イラストを取得
//       const updating = await restoreFromLocalStorage<HyperIllust>(refKey);
//       if (updating.importedByList) {
//         //重複がなければ追加する
//         if (!updating.importedByList.includes(importedKey)) {
//           updating.importedByList = [...updating.importedByList, importedKey];
//           await saveToLocalStorage<HyperIllust>(refKey, updating);
//         }
//       } else {
//         Object.defineProperty(updating, "importIllusts", {
//           value: [importedKey],
//           writable: true
//         });
//         updating.importedByList = [importedKey];
//         await saveToLocalStorage<HyperIllust>(refKey, updating);
//       }
//     }
//   });
// };

// //不要になった被インポート情報を削除する関数
// export const deleteImportInfo = (prevKeys: string[], referedKey: string) => {
//   prevKeys.forEach(async prevKey => {
//     if (prevKey) {
//       //当該イラストを取得
//       const updating = await restoreFromLocalStorage<HyperIllust>(prevKey);
//       if (
//         updating &&
//         updating.importedByList &&
//         updating.importedByList.includes(referedKey)
//       ) {
//         updating.importedByList = updating.importedByList.filter(
//           key => key !== referedKey
//         );
//         await saveToLocalStorage<HyperIllust>(prevKey, updating);
//         //console.log(`インポート情報を削除しました! 対象${prevKey}, インポートしていたもの${referedKey}`);
//       }
//     }
//   });
// };
// //引用情報やインポート情報をまとめて取得する関数
// //なんかちゃんと動いていない
// export const getRefersAndImports = async (
//   key: string
// ): Promise<refersAndImports> => {
//   const target = await restoreFromLocalStorage<HyperIllust>(key);
//   return {
//     referredKeys: target.linkedList || [],
//     referKeys: target.linkedByList || [],
//     importedKeys: target.importedList || [],
//     importKeys: target.importedByList || []
//   };
// };

//引用被引用関係の操作は全部クラウドでやることにしたぞ!

//被引用情報を追加する関数
export const addLinkedInfo = async (itemKey : string, targetKey: string) => {
  //itemにtargetを追加する
  const upDatingMetaKey = await loadMetaData(itemKey);
  if (upDatingMetaKey) {
    if (!upDatingMetaKey.linkedList.includes(targetKey)) {
      upDatingMetaKey.linkedList = [...upDatingMetaKey.linkedList, targetKey];
      //更新したものをアップロード
      await updateMetaData(itemKey, upDatingMetaKey);
    }
  }

  //targetにitemを追加
  const upDatingMetaKey2 = await loadMetaData(targetKey);
  if (upDatingMetaKey2) {
    if (!upDatingMetaKey2.linkedByList.includes(itemKey)) {
      upDatingMetaKey2.linkedByList = [...upDatingMetaKey2.linkedByList, itemKey];
      //更新したものをアップロード
      await updateMetaData(targetKey, upDatingMetaKey2);
    }
  }
};

//被引用情報を削除する関数
export const deleteLinkedInfo = async (itemKey : string, targetKey: string) => {
  //itemにtargetを追加する
  const upDatingMetaKey = await loadMetaData(itemKey);
  if (upDatingMetaKey) {
    if (upDatingMetaKey.linkedByList.includes(targetKey)) {
      upDatingMetaKey.linkedByList = upDatingMetaKey.linkedByList.filter(item => item !== targetKey);
      await updateMetaData(itemKey, upDatingMetaKey);
    }
  }

  //targetにitemを追加
  const upDatingMetaKey2 = await loadMetaData(targetKey);
  if (upDatingMetaKey2) {
    if (upDatingMetaKey2.linkedByList.includes(itemKey)) {
      upDatingMetaKey2.linkedByList = upDatingMetaKey2.linkedByList.filter(item => item !== itemKey);
      await updateMetaData(targetKey, upDatingMetaKey2);
    }
  }
};

//被インポート情報を追加する関数
export const addImportInfo = async (itemKey : string, targetKey: string) => {
  //itemにtargetを追加する
  const upDatingMetaKey = await loadMetaData(itemKey);
  if (upDatingMetaKey) {
    if (!upDatingMetaKey.importedList.includes(targetKey)) {
      upDatingMetaKey.importedList = [...upDatingMetaKey.importedList, targetKey];
      await updateMetaData(itemKey, upDatingMetaKey);
    }
  }
  //targetにitemを追加
  const upDatingMetaKey2 = await loadMetaData(targetKey);
  if (upDatingMetaKey2) {
    if (!upDatingMetaKey2.importedByList.includes(itemKey)) {
      upDatingMetaKey2.importedByList = [...upDatingMetaKey2.importedByList, itemKey];
      await updateMetaData(targetKey, upDatingMetaKey2);
    }
  }
};

//被インポート情報を削除する関数
export const deleteImported = async (itemKey : string, targetKey: string) => {
  //itemにtargetを追加する
  const upDatingMetaKey = await loadMetaData(itemKey);
  if (upDatingMetaKey) {
    if (upDatingMetaKey.importedList.includes(targetKey)) {
      upDatingMetaKey.importedList = upDatingMetaKey.importedList.filter(item => item !== targetKey);
      await updateMetaData(itemKey, upDatingMetaKey);
    }
  }

  //targetにitemを追加
  const upDatingMetaKey2 = await loadMetaData(targetKey);
  if (upDatingMetaKey2) {
    if (upDatingMetaKey2.importedByList.includes(itemKey)) {
      upDatingMetaKey2.importedByList = upDatingMetaKey2.importedByList.filter(item => item !== itemKey);
      await updateMetaData(targetKey, upDatingMetaKey2);
    }
  }
};
