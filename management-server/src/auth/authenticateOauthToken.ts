import jwt from 'jsonwebtoken';

const secretKey = process.env.TWITCH_REDCHAT_SECRET_KEY || 'test';
const SECRET_BUFFER = new Buffer(secretKey, 'base64');

interface AuthResult {
  exp: number;
  user_id: string;
  role: string;
}

export default function authenticateOauthToken(token) {
  console.log(token, secretKey);
  return jwt.verify(token, SECRET_BUFFER) as AuthResult;
}
