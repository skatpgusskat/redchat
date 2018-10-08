import AWS = require('aws-sdk');
import { wait } from './wait';

const documentClient = new AWS.DynamoDB.DocumentClient({
  region: 'ap-northeast-2',
});

const MAX_RETRIAL_COUNT = 5;

export async function runWithOptimisticLock(functionBlock: () => void) {
  for (let i = 0; i < MAX_RETRIAL_COUNT; i += 1) {
    try {
      await functionBlock();
    } catch (err) {
      const { retryDelay, code } = err;
      if (code !== 'ConditionalCheckFailedException') {
        throw err;
      }
      await wait(retryDelay * 1000);
    }
  }
}

// export async function putWithOptimisticLock(functionBlock: () => {}) {
//   const item: EmoticonDocument = result.Item as EmoticonDocument || {
//     id: userId,
//     emoticonMap: {},
//     version: 0,
//   };

//   item.emoticonMap[mediaId] = {
//     id: mediaId,
//     command,
//     inUse: false,
//   };

//   const currentVersion = item.version;
//   item.version += 1;

//   await documentClient.put({
//     ConditionExpression: 'version = :version',
//     ExpressionAttributeValues: {
//       ':version': currentVersion,
//     },
//     TableName: tableName,
//     Item: item,
//   }).promise();
// }

export async function putDocumnetWithVersion(tableName: string, item: { version: number }) {
  const currentVersion = item.version;
  item.version += 1;

  await documentClient.put({
    ConditionExpression: 'version = :version',
    ExpressionAttributeValues: {
      ':version': currentVersion,
    },
    TableName: tableName,
    Item: item,
  }).promise();
}
