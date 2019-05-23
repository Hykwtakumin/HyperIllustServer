/*Configure済みAWSObjectを渡す*/
import * as AWS from "aws-sdk";
import { S3 } from "aws-sdk";

const region = process.env.AWSRegion;
const keyId = process.env.AWSAccessKeyId;
const SecretKey = process.env.AWSSecretKey;

export const configuredS3 = (): S3 => {
  AWS.config.region = region;
  const s3 = new AWS.S3({
    accessKeyId: keyId,
    secretAccessKey: SecretKey
  });
  return s3;
};
