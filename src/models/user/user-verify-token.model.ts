import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { userDB } from '../../config/database.js';

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
  }
}, { timestamps: true })

export const UserVerifyTokenModel = userDB.model<UserVerifyToken>('user-verify-token', UserVerifyTokenSchema);

export type UserVerifyTokenDocument = HydratedDocument<UserVerifyToken>