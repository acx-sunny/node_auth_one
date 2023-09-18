import dotenv from "dotenv";
dotenv.config();

const secretKey = process.env.TOKEN_SECRET_KEY;

const secretRefreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

const secretKeyDuration1 = process.env.SECRET_TOKEN_DAY1;

const secretKeyDuration2 = process.env.SECRET_TOKEN_DAY2;

const PORT = process.env.SERVER_PORT || 4000;

const mongoURL = process.env.DATABASE_MONGODB_URL;

export { secretKey, secretRefreshKey, secretKeyDuration1, secretKeyDuration2, PORT, mongoURL };
