import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  db_uri: process.env.MONGO_URI,
  user_db_name: process.env.USER_DB_NAME,
  salt_or_rounds: process.env.BCRYPT_SALT_OR_ROUNDS ? Number(process.env.BCRYPT_SALT_OR_ROUNDS) : 10,
  verification_token_expores_in: process.env.VERIFICATION_TOKEN_EXPIRES_IN ? Number(process.env.VERIFICATION_TOKEN_EXPIRES_IN) : 86400,
  recovery_code_expores_in: process.env.RECOVERY_CODE_EXPIRES_IN ? Number(process.env.RECOVERY_CODE_EXPIRES_IN) : 7200,
}

export const userDB = mongoose.createConnection(`${dbConfig.db_uri}/${dbConfig.user_db_name}`);

export default dbConfig;