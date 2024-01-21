import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { userDB } from '../../config/database.js';

export type User = {
  username: string;
  email: string;
  password: string;
  email_verified?: boolean,
  avatar?: string
}

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 40,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    min: 3,
    max: 255,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
    min: 6,
    max: 255,
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String
  }
}, { timestamps: true })

export const UserModel = userDB.model<User>('user', UserSchema);

export type UserDocument = HydratedDocument<User>