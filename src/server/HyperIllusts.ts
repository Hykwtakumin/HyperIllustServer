import {
  getMongoCollection,
  illustCollectionName,
  userCollectionName
} from "./services/db";
import {
  DateLike,
  HyperIllust,
  HyperIllustParams,
  HyperIllustUser,
  UserParams
} from "./services/model";
import { logger } from "../share/logger";
import { ObjectID } from "bson";
import uuid = require("uuid");
import shortid = require("shortid");
import { Collection, InsertOneWriteOpResult, MongoClient } from "mongodb";
import * as socketIo from "socket.io";
import { promiseDeleteFile } from "./services/s3";

const { debug } = logger("service:hic");

// async function getIllustCollection() {
//   return await getMongoCollection(illustCollectionName).catch(e => debug(e));
// }
//
// async function getUserCollection() {
//   return await getMongoCollection(userCollectionName).catch(e => debug(e));
// }

//ハイパーイラストの取得
export async function getHyperIllust(
  id: string,
  dbClient: MongoClient
): Promise<HyperIllust> {
  const collection: Collection = dbClient
    .db("drawwiki")
    .collection(illustCollectionName);
  const result = await collection.findOne(ObjectID.createFromHexString(id));
  if (result === null) {
    throw new Error("Document not found");
  }
  return result;
}

//ハイパーイラストの新規作成
export async function createHyperIllust(
  params: HyperIllustParams,
  dbClient: MongoClient
) {
  const now = new Date();
  const collection: Collection = dbClient
    .db("drawwiki")
    .collection(illustCollectionName);
  const { ops } = await collection.insertOne(
    Object.assign({ version: 1, updatedAt: now, createdAt: now }, params)
  );
  if (ops === null) {
    debug("Creating HyperIllust is failed");
    throw new Error("Creating HyperIllust is failed");
  }
  return ops[0] as HyperIllust;

  return new Promise<HyperIllust>((resolve, reject) => {
    const now = new Date();
    const collection: Collection = dbClient
      .db("drawwiki")
      .collection(illustCollectionName);
    if (collection) {
      collection
        .insertOne(
          Object.assign({ version: 1, updatedAt: now, createdAt: now }, params)
        )
        .then((result: InsertOneWriteOpResult) => {
          const { ops } = result;
          if (!ops) {
            debug("Creating HyperIllust is failed");
            reject(Error("Creating HyperIllust is failed"));
          } else {
            debug(`HyperIllust created!`);
            resolve(ops[0] as HyperIllust);
          }
        })
        .catch(error => {
          debug(error);
          reject(error);
        });
    } else {
      debug("collection not found");
      reject(Error("collection not found"));
    }
  });
}

//ハイパーイラストの更新
//更新通知は必要だろうか?
export async function updateHyperIllust(
  id: string,
  newParams: HyperIllustParams,
  io: socketIo.Server,
  dbClient: MongoClient
): Promise<HyperIllust> {
  const {
    sourceKey,
    sourceURL,
    name,
    desc,
    size,
    owner,
    isForked,
    origin
  } = newParams;
  //const updatingHyperIllust = await getHyperIllust(id);
  //今の所Permission等は考えていない
  const now = new Date();
  const collection: Collection = dbClient
    .db("drawwiki")
    .collection(illustCollectionName);
  const { value } = await collection.findOneAndUpdate(
    {
      _id: ObjectID.createFromHexString(id)
    },
    {
      $inc: { version: 1 },
      $set: {
        sourceKey,
        sourceURL,
        name,
        desc,
        size,
        owner,
        isForked,
        origin,
        now
      }
    },
    {
      upsert: true,
      returnOriginal: false
    }
  );
  //更新通知をsocketで配信?
  return value;
}

//ハイパーイラストの削除
//findOneAndDeleteの返り値がよくわからん...
export async function deleteHyperIllust(
  id: string,
  dbClient: MongoClient
): Promise<any> {
  const collection: Collection = dbClient
    .db("drawwiki")
    .collection(illustCollectionName);
  const deletedIllust = (await collection.findOneAndDelete({
    id: id
  })) as HyperIllust;
  //S3のデータも削除する
  await promiseDeleteFile(deletedIllust.sourceKey);
  return deletedIllust;
}

//ハイパーイラストのフォーク
export async function forkHyperIllust(
  id: string,
  dbClient: MongoClient
): Promise<HyperIllust> {
  const origin = await getHyperIllust(id, dbClient);
  return;
}

//Userの新規作成
//重複した場合の処理は別の所でやる?
export async function createUser(
  params: UserParams,
  dbClient: MongoClient
): Promise<HyperIllustUser> {
  const { name } = params;

  return new Promise<HyperIllustUser>((resolve, reject) => {
    const now = new Date();
    const collection: Collection = dbClient
      .db("drawwiki")
      .collection(userCollectionName);
    if (collection) {
      getUser(name, dbClient)
        .then((user: HyperIllustUser) => {
          //ユーザーが既にいるのでreject
          debug("User already exists");
          reject(Error("User already exists"));
        })
        .catch(error => {
          debug(error);
          //ユーザーがいないので新規作成
          debug("ユーザーがいないので新規作成");
          collection
            .insertOne(
              Object.assign(
                { version: 1, updatedAt: now, createdAt: now },
                params
              )
            )
            .then((result: InsertOneWriteOpResult) => {
              const { ops } = result;
              if (!ops) {
                debug("Creating User is failed");
                reject(Error("Creating User is failed"));
              } else {
                resolve(ops[0] as HyperIllustUser);
              }
            })
            .catch(error => {
              debug(error);
              reject(error);
            });
        });
    } else {
      debug("collection not found");
      reject(Error("collection not found"));
    }
  });
}

//Userの取得
//名前からUserを取得する?
export async function getUser(
  name: string,
  dbClient: MongoClient
): Promise<HyperIllustUser> {
  //const collection: Collection = await getUserCollection().catch(e => debug(e));
  // const collection: Collection = dbClient.db("drawwiki").collection(userCollectionName);
  // debug(`これからfindOneする`);
  // let returnUser;
  // const result = collection.findOne({ name: name }).then((user: HyperIllustUser) => {
  //   if (!user) {
  //     debug("userが存在しないので新規作成");
  //     createUser({ name }, dbClient).catch(error => debug(error));
  //   }
  //   debug("userがいる");
  //   returnUser = result;
  //   return result;
  // }).catch(error => {
  //   debug(error);
  //   throw new Error(error);
  // });
  // debug(`findOneした後`);

  return new Promise<HyperIllustUser>((resolve, reject) => {
    const collection: Collection = dbClient
      .db("drawwiki")
      .collection(userCollectionName);
    if (collection) {
      collection.findOne({ name: name }).then((user: HyperIllustUser) => {
        if (!user) {
          //見つからない場合はnullが返ってくる
          //新規作成は別の所でやる
          debug("user not found");
          reject(Error("user not found"));
        } else {
          debug(`user found! id: ${user.id}, name: ${user.name}`);
          resolve(user);
        }
      });
    } else {
      debug("collection not found");
      reject(Error("collection not found"));
    }
  });
}

//Userの画像取得
//件数とかオプションで指定できた方が良いかも?
export async function getUsersIllusts(
  name: string,
  dbClient: MongoClient
): Promise<HyperIllust[]> {
  const user: HyperIllustUser = await getUser(name, dbClient);
  const collection: Collection = dbClient
    .db("drawwiki")
    .collection(illustCollectionName);
  //これで検索できるか?
  return await collection.find({ "owner.id": user.id }).toArray();
}

//Userの画像件数取得
export async function getUsersIllustsCount(
  name: string,
  dbClient: MongoClient
): Promise<number> {
  //const db = dbClient.db("drawwiki").collection(userCollectionName)
  const user: HyperIllustUser = await getUser(name, dbClient);
  const collection: Collection = dbClient
    .db("drawwiki")
    .collection(illustCollectionName);
  //これで検索できるか?
  return await collection.find({ "owner.id": user.id }).count();
}
