import * as AWS from "aws-sdk";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { promisify } from "util";
import { ManagedUpload } from "aws-sdk/clients/s3";
import { ManagedAction } from "aws-sdk/clients/elasticbeanstalk";
import { S3 } from "aws-sdk";
dotenv.config();

const { AWSRegion, AWSAccessKeyId, AWSSecretKey } = process.env;
const Bucket = process.env.S3_BUCKET || "hyper-illust-creator";

AWS.config.update({
  region: AWSRegion,
  credentials: new AWS.Credentials(AWSAccessKeyId, AWSSecretKey)
});

const bucket = new AWS.S3({
  s3ForcePathStyle: true
});

export const asyncReadFile = (path: string): Promise<Buffer> => {
  return promisify(fs.readFile)(path);
};

export const asyncUnLink = (path: string): Promise<any> => {
  return promisify(fs.unlink)(path);
};

export const uploadFile = async (
  Key: string,
  Body: any,
  ContentType: string
): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    bucket
      .upload({ Bucket, Key, Body, ContentType, ACL: "public-read" })
      .promise()
      .then(response => {
        resolve(response);
      })
      .catch(e => reject(e));
  });
};

//バケットにSVGをアップロード
export async function promisePutFile(
  Key: string,
  Body: any,
  ContentType: string
): Promise<ManagedUpload.SendData> {
  return await bucket
    .upload({ Bucket, Key, Body, ContentType, ACL: "public-read" })
    .promise();
}

//バケットからSVGを削除
export async function promiseDeleteFile(
  Key: string
): Promise<S3.Types.DeleteObjectOutput> {
  //
  return await bucket.deleteObject({ Bucket, Key }).promise();
}

export const promiseUpload = async (
  hicId: string,
  file: any,
  mime: string
): Promise<any> => {
  return new Promise<any>(async (resolve, reject) => {
    try {
      // const uploaded = await promisify(fs.readFile)(file.path);
      const params = {
        Key: hicId + ".svg",
        Body: file,
        ContentType: mime
      };

      const uploaded2S3 = await uploadFile(`${hicId}svg`, file, mime);
      resolve(uploaded2S3);
      //await promisify(fs.unlink)(file.path);
    } catch (e) {
      reject(e);
      throw e;
    }
  });
};
