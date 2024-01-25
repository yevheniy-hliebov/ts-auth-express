import { Schema, HydratedDocument } from 'mongoose';
import dbConfig, { userDB } from '../../config/database.js';
import * as bcrypt from 'bcrypt';

export type UserVerifyToken = {
  user_id: string;
  token: string;
}

const UserVerifyTokenSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  token: {
    type: String,
    unique: true,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: dbConfig.verification_token_expores_in,
  }
})

UserVerifyTokenSchema.pre("save", async function (next) {
  if (!this.isModified("token")) {
    return next();
  }
  const hash = await bcrypt.hash(this.token, dbConfig.salt_or_rounds);
  this.token = hash;
  next();
});

export const UserVerifyTokenModel = userDB.model<UserVerifyToken>('user-verify-token', UserVerifyTokenSchema);

export type UserVerifyTokenDocument = HydratedDocument<UserVerifyToken>