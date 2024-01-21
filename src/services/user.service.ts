import HttpException from "../exceptions/HttpException.js";
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
      createUserDto.password = await this.hashPassword(createUserDto.password);
      const createdUser = await UserModel.create(createUserDto);
      const logger = new Logger(proccesName)
      logger.log('User created. id: ' + createdUser.id)
      return filterObjectByKeys(createdUser, ['id', 'username', 'email', 'email_verified']);
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        throw new HttpException(proccesName, 'User with this email already exists.', 409);
      } else {
        throw new HttpException(proccesName, 'Internal Server Error', 500);
      }
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

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10)
  }
}

const userService = UserService.getInstance()

export default userService;