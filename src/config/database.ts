import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  db_uri: process.env.MONGO_URI,
  user_db_name: process.env.USER_DB_NAME,
}

export const userDB = mongoose.createConnection(`${dbConfig.db_uri}/${dbConfig.user_db_name}`);

export default dbConfig;