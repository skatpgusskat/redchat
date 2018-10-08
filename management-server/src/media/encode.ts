import AWS = require('aws-sdk');
import fileType from 'file-type';
import encodeImage from './encodeImage';
import encodeVideo from './encodeVideo';

const s3 = new AWS.S3();

const S3_BUCKET_BEFORE_ENCODE = 'redchat-emoticon-before-encode';
const S3_BUCKET_AFTER_ENCODE = 'redchat-emoticon-after-encode';

export async function encode(key: string) {
  const { Body: body } = await s3.getObject({
    Bucket: S3_BUCKET_BEFORE_ENCODE,
    Key: key,
  }).promise();

  const { ext, mime } = fileType(body);

  if (['image', 'video'].every((type) => !mime.startsWith(type))) {
    throw new Error(`Cannot encode media ${mime}`);
  }

  const encodedMedia = mime.startsWith('image/') && ext !== 'gif'
    ? await encodeImage(body)
    : await encodeVideo(body);
  console.log('after encode');
  const encodedMediaMime = fileType(encodedMedia).mime;

  await s3.putObject({
    Bucket: S3_BUCKET_AFTER_ENCODE,
    Key: key,
    Body: encodedMedia,
    ContentType: encodedMediaMime,
  }).promise();
}
