import { logger } from "../../../share/logger";
import { DateLike } from "../../../share/model";

const debug = logger(`client:locaStorage`);

export type LocalStorageObject<T> = T & {
  storedAt: DateLike;
  expiredAt?: DateLike;
};

export type restoredObject<T> = {
  data: T;
  storedAt: DateLike;
};

export function isRestoredObject(object: any): boolean {
  return object.hasOwnProperty("data") && object.hasOwnProperty("storedAt");
}

export function saveToLocalStorage<T>(
  key: string,
  item: T,
  expiredAt?: Date
): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    if (localStorage) {
      try {
        const insertItem: LocalStorageObject<T> = Object.assign(
          {
            storedAt: new Date(),
            expiredAt
          },
          item
        );
        localStorage.setItem(key, JSON.stringify(insertItem));
        resolve(true);
      } catch (error) {
        debug.error(error);
        reject(error);
      }
    } else {
      debug.error("localStorageにアクセスできません");
      reject(Error("Cannot access to localStorage"));
    }
  });
}

export function restoreFromLocalStorage<T>(
  key: string
): Promise<restoredObject<T>> {
  return new Promise<restoredObject<T>>((resolve, reject) => {
    if (localStorage) {
      const restoredItem = JSON.parse(localStorage.getItem(key));
      if (isRestoredObject(restoredItem)) {
        resolve(restoredItem);
      } else {
        debug.error("不正なデータです");
        reject(Error("Invalid localStorage data"));
      }
    } else {
      debug.error("localStorageにアクセスできません");
      reject(Error("Cannot access to localStorage"));
    }
  });
}

export function deleteObjectFromLocalStorage(key: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (localStorage) {
      localStorage.removeItem(key);
    } else {
      debug.error("localStorageにアクセスできません");
      reject(Error("Cannot access to localStorage"));
    }
  });
}
