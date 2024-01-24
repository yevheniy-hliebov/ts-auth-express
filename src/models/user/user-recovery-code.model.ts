import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { userDB } from '../../config/database.js';

export type UserRecoveryCode = {
  email: string;
  code: string;
}

const UserRecoveryCodeSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 3600,
  }
})

export const UserRecoveryCodeModel = userDB.model<UserRecoveryCode>('user-recovery-codes', UserRecoveryCodeSchema);

export type UserRecoveryCodeDocument = HydratedDocument<UserRecoveryCode>