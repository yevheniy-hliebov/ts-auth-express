import { NextFunction, Request, Response } from "express";
import AuthService from "../services/auth.service.js";
import { AuthRequest, LoginDto, RegisterDto, VerifyEmaiDto } from "../types/auth.type.js";

class AuthController {
  private static instance: AuthController;
  private authService = AuthService;
  constructor() { }

  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  public async register(req: Request, res: Response, next: NextFunction) {
    const user: RegisterDto = req.body;
    AuthService.register(user)
      .then((registerResult: any) => {
        res.status(201).json({ email: registerResult.user.email, token: registerResult.token });
      })
      .catch(error => {
        next(error)
      })
  }
  public async login(req: Request, res: Response, next: NextFunction) {
    const user: LoginDto = req.body;
    AuthService.login(user)
      .then((loginResult: any) => {
        res.status(200).json({ email: loginResult.user.email, token: loginResult.token });
      })
      .catch(error => {
        next(error)
      })
  }

  public async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    const user_id: string = req.user.id;   
    const password = req.body['password'];
    const new_password = req.body['new_password'];
    AuthService.changePassword(user_id, password, new_password)
      .then(() => {
        res.status(200).json({ message: 'Password was changed' });
      })
      .catch(error => {
        next(error)
      })
  }

  public async verifyEmail(req: Request, res: Response, next: NextFunction) {
    const verifyEmailDto: VerifyEmaiDto = {
      email: req.params['email'],
      token: req.query['token'] ? req.query['token'].toString() : '',
    };
    AuthService.verifyEmail(verifyEmailDto)
      .then((verifyEmailResult: any) => {
        res.status(200).json({ email: verifyEmailResult?.email, email_verified: verifyEmailResult?.email_verified });
      })
      .catch(error => {
        next(error)
      })
  }
}

const authController = AuthController.getInstance()

export default authController;