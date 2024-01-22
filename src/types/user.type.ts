import { Document, Types } from "mongoose";
import { User } from "../models/user/user.model.js";

export type CreateUserDto = {
  username: string;
  email: string;
  password: string;
}