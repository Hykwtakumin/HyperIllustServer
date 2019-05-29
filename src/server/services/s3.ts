import * as AWS from "aws-sdk";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { promisify } from "util";
dotenv.config();

const { region, accessKeyId, secretAccessKey } = process.env;
const Bucket = process.env.S3_BUCKET || "hyper-illust-creator";

AWS.config.update({ accessKeyId, secretAccessKey, region });
const bucket = new AWS.S3({
  s3ForcePathStyle: true
});

export const uploadFile = async ({ Key, Body, ContentType }): Promise<any> => {
  return await bucket.upload({ Bucket, Key, Body, ContentType }).promise();
};

export const deleteFile = async (key: string) => {
  const deleteReq = {
    Bucket: Bucket,
    key: key
  };
  await bucket.deleteObject(deleteReq).promise();
};

export const promiseUpload = async (
  hicId: string,
  file: any,
  mime: string
): Promise<any> => {
  return new Promise<any>(async (resolve, reject) => {
    try {
      const uploaded = await promisify(fs.readFile)(file.path);
      const params = {
        Key: hicId + ".svg",
        Body: uploaded,
        ContentType: mime
      };

      const uploaded2S3 = await uploadFile(params);
      resolve(uploaded2S3);
      await promisify(fs.unlink)(file.path);
    } catch (e) {
      reject(e);
      throw e;
    }
  });
};
