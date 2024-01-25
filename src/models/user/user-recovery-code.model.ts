import { Schema, HydratedDocument } from 'mongoose';
import dbConfig, { userDB } from '../../config/database.js';
import * as bcrypt from 'bcrypt';

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
    expires: dbConfig.recovery_code_expores_in,
  }
})

UserRecoveryCodeSchema.pre("save", async function (next) {
  if (!this.isModified("code")) {
    return next();
  }
  const hash = await bcrypt.hash(this.code, dbConfig.salt_or_rounds);
  this.code = hash;
  next();
});

export const UserRecoveryCodeModel = userDB.model<UserRecoveryCode>('user-recovery-codes', UserRecoveryCodeSchema);

export type UserRecoveryCodeDocument = HydratedDocument<UserRecoveryCode>