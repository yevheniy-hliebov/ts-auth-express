import { Request } from "express";

export type AuthRequest = Request & { user?: any; isPublic?: boolean }

export type RegisterDto = {
  username: string;
  email: string;
  password: string;
}

export type LoginDto = {
  email: string;
  password: string;
}

export type VerifyEmaiDto = {
  email: string;
  token: string;
}

export type ResetPasswordDto = {
  email: string;
  code: string;
  new_password: string;
  confirm_password: string;
}