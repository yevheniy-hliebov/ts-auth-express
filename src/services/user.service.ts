import dbConfig from "../config/database.js";
import HttpException from "../exceptions/http.exception.js";
import { User, UserDocument, UserModel } from "../models/user/user.model.js";
import filterObjectByKeys from "../modules/filter-object.js";
import Logger from "../modules/logger.js";
import { CreateUserDto } from "../types/user.type.js";
import { createdUserValidation } from "../validation/user.validation.js";
import * as bcrypt from 'bcrypt';

export class UserService {
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async create(createUserDto: CreateUserDto): Promise<UserDocument | { [key: string]: any }> {
    const proccesName = 'CreatingUser';
    createdUserValidation(createUserDto);
    try {
      // createUserDto.password = await this.hashPassword(createUserDto.password);
      const createdUser = await new UserModel(createUserDto).save();
      // const createdUser = await UserModel.create(createUserDto);
      const logger = new Logger(proccesName)
      logger.log('User created. id: ' + createdUser.id)
      const createdUserFilter = filterObjectByKeys(createdUser, ['id', 'username', 'email', 'email_verified']);
      return createdUserFilter;
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        throw new HttpException(proccesName, 'User with this email already exists.', 409);
      } else {
        throw new HttpException(proccesName, 'Internal Server Error', 500);
      }
    }
  }

  public async verifyEmail(email: string) {
    const proccesName = 'VerifyEmail';
    try {
      const verifiedUser = await UserModel.findOneAndUpdate({ email: email }, { email_verified: true }, { new: true }).select({ id: 1, email: 1, email_verified: 1 }).exec();
      const logger = new Logger(proccesName)
      logger.log('The email has been verified. id: ' + verifiedUser?.id)
      return verifiedUser;
    } catch (error) {
      throw new HttpException(proccesName, 'Failed verify email', 500);
    }
  }

  public async findOne(filter: object, select = {}) {
    const proccesName = 'FindUser';
    try {
      const user = await UserModel.findOne(filter).select(select).exec();
      if (!user) {
        throw new HttpException(proccesName, 'User not found', 404);
      }
      const logger = new Logger(proccesName)
      logger.log('User found. id: ' + user.id)
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(proccesName, 'Internal Server Error', 500);
      }
    }
  }

  public async findById(id: string, select = {}) {
    const proccesName = 'FindByIdUser';
    try {
      const user = await UserModel.findById(id).select(select).exec();
      if (!user) {
        throw new HttpException(proccesName, 'User not found', 404);
      }
      const logger = new Logger(proccesName)
      logger.log('User found. id: ' + user.id)
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(proccesName, 'Internal Server Error', 500);
      }
    }
  }

  public async findAll(filter = {}, select = {}) {
    const proccesName = 'FindUsers';
    try {
      const users = await UserModel.find(filter).select(select).exec();
      const logger = new Logger(proccesName)
      logger.log('Find users')
      return users;
    } catch (error) {
      throw new HttpException(proccesName, 'Internal Server Error', 500);
    }
  }
  
  public async changePassword(id: string, newPassword: string) {
    const proccesName = 'ChangePassword';
    const logger = new Logger(proccesName)
    try {
      const hashNewPassword = await this.hashPassword(newPassword);
      const changedUser = await UserModel.findByIdAndUpdate(id, { password: hashNewPassword }, { new: true }).exec()
      if (!changedUser) {
        throw new HttpException(proccesName, 'User not found', 404);
      }
      logger.log('Changed password. id: ' + changedUser.id)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(proccesName, 'An error occurred while changing the password', 500);
      }
    }
  }

  public async hashPassword(password: string) {
    return await bcrypt.hash(password, dbConfig.salt_or_rounds);
  }
}

const userService = UserService.getInstance()

export default userService;