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
} from "../share/model";
import { logger } from "../share/logger";
import { ObjectID } from "bson";
import uuid = require("uuid");
import shortid = require("shortid");
import { Collection } from "mongodb";
import * as socketIo from "socket.io";
import { promiseDeleteFile } from "./services/s3";

const { debug } = logger("service:hic");

async function getIllustCollection() {
  return await getMongoCollection(illustCollectionName).catch(e => debug(e));
}

async function getUserCollection() {
  return await getMongoCollection(userCollectionName).catch(e => debug(e));
}

//ハイパーイラストの取得
export async function getHyperIllust(id: string): Promise<HyperIllust> {
  const collection: Collection = await getIllustCollection();
  const result = await collection.findOne(ObjectID.createFromHexString(id));
  if (result === null) {
    throw new Error("Document not found");
  }
  return result;
}

//ハイパーイラストの新規作成
export async function createHyperIllust(params: HyperIllustParams) {
  const now = new Date();
  const collection: Collection = await getIllustCollection();
  const { ops } = await collection.insertOne(
    Object.assign({ version: 1, updatedAt: now, createdAt: now }, params)
  );
  if (ops === null) {
    debug("Creating HyperIllust is failed");
    throw new Error("Creating HyperIllust is failed");
  }
  return ops[0] as HyperIllust;
}

//ハイパーイラストの更新
//更新通知は必要だろうか?
export async function updateHyperIllust(
  id: string,
  newParams: HyperIllustParams,
  io: socketIo.Server
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
  const collection: Collection = await getIllustCollection();
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
export async function deleteHyperIllust(id: string): Promise<any> {
  const collection: Collection = await getIllustCollection();
  const deletedIllust = (await collection.findOneAndDelete({
    id: id
  })) as HyperIllust;
  //S3のデータも削除する
  await promiseDeleteFile(deletedIllust.sourceKey);
  return deletedIllust;
}

//ハイパーイラストのフォーク
export async function forkHyperIllust(id: string): Promise<HyperIllust> {
  const origin = await getHyperIllust(id);
  return;
}

//Userの新規作成
//重複した場合の処理は別の所でやる?
export async function createUser(params: UserParams): Promise<HyperIllustUser> {
  const now = new Date();
  const collection: Collection = await getUserCollection().catch(error =>
    debug(error)
  );
  const { name } = params;
  if (await getUser(name)) {
    debug("User already exists");
    throw new Error("User already exists");
  }
  const { ops } = await collection.insertOne(
    Object.assign({ version: 1, updatedAt: now, createdAt: now }, params)
  );
  if (ops === null) {
    debug("Creating User is failed");
    throw new Error("Creating User is failed");
  }
  return ops[0] as HyperIllustUser;
}

//Userの取得
//名前からUserを取得する?
export async function getUser(name: string): Promise<HyperIllustUser> {
  const collection: Collection = await getUserCollection().catch(e => debug(e));
  const result = await collection
    .findOne({ name: name })
    .catch(error => debug(error));
  //存在しない倍は新規作成したユーザーを返す?
  if (result === null) {
    return await createUser({ name }).catch(error => debug(error));
  }
  return result as HyperIllustUser;
}

//Userの画像取得
//件数とかオプションで指定できた方が良いかも?
export async function getUsersIllusts(name: string): Promise<HyperIllust[]> {
  const user: HyperIllustUser = await getUser(name);
  const collection: Collection = await getIllustCollection();
  //これで検索できるか?
  return await collection.find({ "owner.id": user.id }).toArray();
}

//Userの画像件数取得
export async function getUsersIllustsCount(name: string): Promise<number> {
  const user: HyperIllustUser = await getUser(name);
  const collection: Collection = await getIllustCollection();
  //これで検索できるか?
  return await collection.find({ "owner.id": user.id }).count();
}
