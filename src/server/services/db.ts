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

export const mongoDbSetup = async (): Promise<MongoClient> => {
  debug("Connecting to MongoDB.");
  //TODO 接続失敗時のリトライ処理

  // const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true });
  // const db = client.db(dbName);
  // debug(db);
  // debug(db.collection(illustCollectionName));
  // debug(db.collection(userCollectionName));

  //とりあえずMongoClientだけ渡して後はrouterの中でやらせる(あまり良くない)
  return new Promise<MongoClient>((resolve, reject) => {
    MongoClient.connect(mongoUrl, { useNewUrlParser: true })
      .then(client => {
        debug(client);
        resolve(client);
      })
      .catch(e => {
        debug(e);
        reject(e);
      });
  });
};

const collections = Object.create(null);
export const getMongoCollection = (
  collectionName: string
): Promise<Collection> => {
  // let coll = collections[collectionName];
  //if (coll) return coll;
  //const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true }).catch(e => debug(e));
  //coll = client.db(dbName).collection(collectionName);
  //return client.db(dbName).collection(collectionName);
  return new Promise<Collection>((resolve, reject) => {
    MongoClient.connect(mongoUrl, { useNewUrlParser: true })
      .then((result: MongoClient) => {
        //debug(result.db(dbName).collection(collectionName));
        const collectinon: Collection = result
          .db(dbName)
          .collection(collectionName);
        result.close();
        resolve(collectinon);
      })
      .catch(e => {
        debug(e);
        reject(e);
      });
  });
};
