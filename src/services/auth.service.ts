import configuragion, { nodemailerConfig } from '../config/configuration.js';
import HttpException from '../exceptions/http.exception.js';
import { UserVerifyTokenModel } from '../models/user/user-verify-token.model.js';
import Logger from '../modules/logger.js';
import { LoginDto, RegisterDto, ResetPasswordDto, VerifyEmaiDto } from '../types/auth.type.js';
import UserService from './user.service.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import { UserRecoveryCode, UserRecoveryCodeModel } from '../models/user/user-recovery-code.model.js';

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
          token: jwt.sign(payload, configuragion.jwt_secret, { expiresIn: configuragion.jwt_expires_in + 's' }),
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
          token: jwt.sign(payload, configuragion.jwt_secret, { expiresIn: configuragion.jwt_expires_in + 's' }),
        };
      })
      .catch(error => {
        if (error instanceof HttpException) {
          throw new HttpException('LoginUser', `Failed to login: ${error.message}`, error.statusCode, error.errors);
        }
      })
  }

  public async changePassword(id: string, password: string, newPassword: string) {
    const logger = new Logger('ChangePassword')
    const user = await this.userService.findById(id);
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      throw new HttpException('ChangePassword', 'Password is incorrect', 401);
    } else {
      this.userService.changePassword(id, newPassword)
        .catch(error => {
          throw error;
        })
    }
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

  public async forgotPassword(email: string) {
    try {
      const logger = new Logger('ForgotPassword');
      const recoveryCode = this.generateRecoveryCode();
      await this.userService.findOne({ email: email }, { id: 1, email: 1 });
      const existingRecoveryCode = await UserRecoveryCodeModel.findOne({ email: email });
      if (existingRecoveryCode) {
        await UserRecoveryCodeModel.updateOne({ email: email }, { $set: { code: recoveryCode } });
      } else {
        await UserRecoveryCodeModel.create({ email: email, code: recoveryCode });
      }

      const transporter = nodemailer.createTransport(nodemailerConfig);
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset password</title>
        </head>
          <body>
              <p>Your recovery code is: <strong>${recoveryCode}</strong></p>
              <p>If you have not sent a password reset request, please ignore this email.</p>
          </body>
          </html>`

      const mailOptions = {
        from: nodemailerConfig.auth.user,
        to: email,
        subject: "Password Recovery",
        html: html
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logger.error("Error sending Password Recovery to email: ", error);
        } else {
          logger.log('Password Recovery to Email sent: ', info.response);
        }
      });
    } catch (error: any) {
      throw new HttpException('ForgotPassword', 'Failed send recovery code: ' + error.message, 'statusCode' in error ? error.statusCode : 400);
    }
  }

  public async canResetPassword(email: string, code: string) {
    try {
      if (!email || !code) {
        throw new HttpException('CheckCanResetPassword', 'Email and code required', 400);
      }
      await this.userService.findOne({ email: email }, { id: 1, email: 1 });
      const userRecoveryCode: any = await UserRecoveryCodeModel.findOne({ email: email }).exec();
      if (!userRecoveryCode) {
        throw new HttpException('CheckCanResetPassword', 'Recovery code not found', 404);
      }
      if (userRecoveryCode?.code === code) {
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      throw new HttpException('CheckCanResetPassword', 'Error checking password reset permission: ' + error.message, 'statusCode' in error ? error.statusCode : 400);
    }
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code, new_password, confirm_password } = resetPasswordDto;
    try {
      if (!email || !code || !new_password || !confirm_password) {
        throw new HttpException('ResetPassword', 'Email, code, new password and confirmed password required', 400);
      }
      if (new_password !== confirm_password) {
        throw new HttpException('ResetPassword', 'Password and confirmation do not match', 400);
      }
      const user = await this.userService.findOne({ email: email });
      const userRecoveryCode: any = await UserRecoveryCodeModel.findOne({ email: email }).exec();
      if (!userRecoveryCode || userRecoveryCode.code !== code) {
        throw new HttpException('ResetPassword', 'Password reset is not allowed', 400);
      } else {
        user.password = new_password;
        user.save();
        await UserRecoveryCodeModel.findOneAndDelete({ email: email });
      }
    } catch (error: any) {
      throw new HttpException('ResetPassword', 'Error password reset: ' + error.message, 'statusCode' in error ? error.statusCode : 500);
    }
  }

  private generateRecoveryCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  };
}

const authService = AuthService.getInstance()

export default authService;