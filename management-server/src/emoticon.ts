import AWS = require('aws-sdk');
import authenticateExtensionToken from './auth/authenticateExtensionToken';
import extractToken from './auth/extractToken';
import { encode } from './media/encode';
import { runWithOptimisticLock, putDocumnetWithVersion } from './utils/putOptimisticly';

const documentClient = new AWS.DynamoDB.DocumentClient({
  region: 'ap-northeast-2',
});
const tableName = 'redchat-emoticon';

interface EmoticonDocument {
  id: string;
  emoticonMap: {
    [id: string]: {
      id: string;
      command: string;
      inUse: boolean;
    };
  };
  version: number;
}

export async function post(event: any, _: any, callback: (error: Error, result: any) => void) {
  try {
    const body = JSON.parse(event.body);
    const {
      command,
      mediaId,
    } = body;

    const token = extractToken(event.headers);
    const {
      role,
      user_id: userId,
    } = await authenticateExtensionToken(token);
    if (role !== 'broadcaster') {
      throw new Error('you are not broadcaster. fuck you');
    }

    const key = `${userId}/${mediaId}`;

    await encode(key);

    await runWithOptimisticLock(async () => {
      const result = await documentClient.get({
        Key: {
          id: userId,
        },
        TableName: tableName,
        ConsistentRead: true,
      }).promise();

      const item: EmoticonDocument = result.Item as EmoticonDocument || {
        id: userId,
        emoticonMap: {},
        version: 0,
      };

      item.emoticonMap[mediaId] = {
        id: mediaId,
        command,
        inUse: false,
      };

      await putDocumnetWithVersion(tableName, item);
    });


    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Successfully registered',
      }),
    };

    callback(null, response);
  } catch (err) {
    const response = {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(err, Object.getOwnPropertyNames(err)),
    };
    callback(null, response);
  }
}
