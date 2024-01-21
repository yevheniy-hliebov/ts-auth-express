import configuragion from '../config/configuration.js';
import HttpException from '../exceptions/HttpException.js';
import { CreateUserDto } from '../types/user.type.js';
import UserService from './user.service.js';
import jwt, { Jwt } from 'jsonwebtoken';

class AuthService {
  private static instance: AuthService;
  constructor(private userService = UserService) { }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async register(registerDto: CreateUserDto) {
    this.userService.create(registerDto)
      .then(async (registedUser) => {
        const payload = { id: registedUser.id, username: registedUser.username };

        return {
          user: registedUser,
          token: jwt.sign(payload, configuragion.jwt_secret, { expiresIn: configuragion.jwt_expires_in }),
        };
      })
      .catch(error => {
        if (error instanceof HttpException) {
          throw new HttpException('RegisterUser', `Failed to register: ${error.message}`, error.statusCode, error.errors);
        }
      })
  }
}

const authService = AuthService.getInstance()

export default authService;