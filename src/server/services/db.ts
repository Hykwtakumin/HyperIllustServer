import { Collection, MongoClient } from "mongodb";
import { logger } from "../../share/logger";
const { debug } = logger("db:index");
import { mongoDBHost, mongoDBPort, mongoDBEndpoint } from "../env";

let mongoUrl;
if (mongoDBEndpoint) {
  mongoUrl = mongoDBEndpoint;
} else {
  mongoUrl = `mongodb://${mongoDBHost}:${mongoDBPort}`;
}

const dbName: string = "drawwiki";
export const illustCollectionName = `hyperillusts`;
export const userCollectionName = `hyperillustusers`;

export const mongoDbSetup = async () => {
  debug("Connecting to MongoDB.");
  //TODO 接続失敗時のリトライ処理
  const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
  const db = client.db(dbName);
  debug(db);
  debug(db.collection(illustCollectionName));
  debug(db.collection(userCollectionName));
};

export const setUpClient = (): MongoClient => {
  debug("Connecting to MongoDB.");
  return new MongoClient(mongoUrl, { useNewUrlParser: true});
};

const collections = Object.create(null);
export const getMongoCollection = async (
  collectionName: string
): Promise<Collection> => {
  let coll = collections[collectionName];
  if (coll) return coll;
  const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
  coll = client.db(dbName).collection(collectionName);
  return collections[collectionName] || (collections[collectionName] = coll);
};
