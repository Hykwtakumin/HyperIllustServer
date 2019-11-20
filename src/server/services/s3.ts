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

//S3にアップロードを済ませた一時ファイルの削除用
export const asyncUnLink = (path: string): Promise<void> => {
  return promisify(fs.unlink)(path);
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

//バケット内のSVGを取得
//これはBufferで返ってくる
export async function promiseGetFile(
  Key: string
): Promise<S3.Types.GetObjectAclOutput> {
  return await bucket.getObject({ Bucket, Key }).promise();
}
