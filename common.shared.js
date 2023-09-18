import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.TOKEN_SECRET_KEY;

const secretRefreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

const secretKeyDuration1 = process.env.SECRET_TOKEN_DAY1;

const secretKeyDuration2 = process.env.SECRET_TOKEN_DAY2;

export {secretKey, secretRefreshKey, secretKeyDuration1, secretKeyDuration2 }