import * as AWS from "aws-sdk";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { promisify } from "util";
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

export const asyncReadFile = (path: string): Promise<any> => {
  return promisify(fs.readFile)(path);
};

export const asyncUnLink = (path: string): Promise<any> => {
  return promisify(fs.unlink)(path);
};

export const putFile = (
  key: string,
  body: any,
  contentType: string
): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    const params = {
      Body: body,
      Bucket: Bucket,
      Key: key,
      ContentType: contentType,
      ACL: "public-read"
    };
    bucket.putObject(params, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      if (data) {
        resolve(data);
      }
    });
  });
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
      .then(response => resolve(response))
      .catch(e => reject(e));
  });
};

// export const deleteFile = async (key: string) => {
//   const deleteReq = {
//     Bucket: Bucket,
//     key: key
//   };
//   await bucket.deleteObject(deleteReq).promise();
// };

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
