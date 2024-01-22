import configuragion, { nodemailerConfig } from '../config/configuration.js';
import HttpException from '../exceptions/HttpException.js';
import { UserVerifyTokenModel } from '../models/user/user-verify-token.model.js';
import Logger from '../modules/logger.js';
import { LoginDto, RegisterDto, VerifyEmaiDto } from '../types/auth.type.js';
import UserService from './user.service.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';

class AuthService {
  private static instance: AuthService;
  constructor(private userService = UserService) { }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async register(registerDto: RegisterDto) {
    return this.userService.create(registerDto)
      .then(async (createdUser) => {
        this.sendVerifyEmail(createdUser.id, createdUser.email);
        const payload = { id: createdUser.id, username: createdUser.username };
        return {
          user: createdUser,
          token: jwt.sign(payload, configuragion.jwt_secret, { expiresIn: configuragion.jwt_expires_in }),
        };
      })
      .catch(error => {
        if (error instanceof HttpException) {
          throw new HttpException('RegisterUser', `Failed to register: ${error.message}`, error.statusCode, error.errors);
        }
      })
  }

  public async login(loginDto: LoginDto) {
    return this.userService.findOne({ email: loginDto.email }, { id: 1, email: 1, password: 1 })
      .then(async (foundUser) => {
        const logger = new Logger('LoginUser')
        const isMatchPassword = await bcrypt.compare(loginDto.password, foundUser.password)
        if (!isMatchPassword) {
          throw new HttpException('LoginUser', 'Password is incorrect', 401);
        }
        const payload = { id: foundUser.id, username: foundUser.username }
        logger.log(`User with id '${foundUser.id}' successfully authorized`)
        return {
          user: foundUser,
          token: jwt.sign(payload, configuragion.jwt_secret, { expiresIn: configuragion.jwt_expires_in }),
        };
      })
      .catch(error => {
        if (error instanceof HttpException) {
          throw new HttpException('LoginUser', `Failed to login: ${error.message}`, error.statusCode, error.errors);
        }
      })
  }

  public async verifyEmail(verifyEmaiDto: VerifyEmaiDto) {
    return this.userService.findOne({ email: verifyEmaiDto.email }, { id: 1, email: 1, email_verified: 1 })
      .then(async (foundUser) => {
        if (!foundUser.email_verified) {
          return UserVerifyTokenModel.findOne(verifyEmaiDto).exec()
            .then((foundEmailToken: any) => {
              if (foundEmailToken) {
                return this.userService.verifyEmail(verifyEmaiDto.email)
                  .then((verifiedUser) => {
                    UserVerifyTokenModel.deleteOne({ email: foundEmailToken.email }).exec()
                    return verifiedUser;
                  })
                  .catch(error => {
                    if (error instanceof HttpException) {
                      throw error;
                    }
                  })
              }
            })
            .catch(error => {
              throw error;
            })
        } else {
          return foundUser
        }
      })
  }

  private async sendVerifyEmail(user_id: string, userEmail: string) {
    const logger = new Logger('SendingVerifyEmail');

    const transporter = nodemailer.createTransport(nodemailerConfig);

    async function saveToken() {
      try {
        const token = uuid() + '-' + Date.now();
        await UserVerifyTokenModel.create({
          email: userEmail,
          token: token
        })
        logger.log('Verivication Token was saved successfully');
        return token;
      }
      catch (error: any) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.token) {
          await saveToken();
        } else {
          logger.error('Failed save token', error.message, error.stack)
        }
      }
    }

    const token = await saveToken();

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    </head>
      <body>
          <p>Welcome!</p>
          <p>Please click the button below to verify your email:</p>
          <a href="${configuragion.url_domain_verification}/verification/${userEmail}?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>If you didn't create this account, please ignore this email.</p>
      </body>
      </html>`

    const mailOptions = {
      from: nodemailerConfig.auth.user,
      to: userEmail,
      subject: "You have successfully registered",
      text: "Thank you for joining us!",
      html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error("Error sending email: ", error);
      } else {
        logger.log('Email sent: ', info.response);
      }
    });
  }
}

const authService = AuthService.getInstance()

export default authService;