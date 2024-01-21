import { NextFunction, Request, Response } from "express";
import AuthService from "../services/auth.service.js";
import { CreateUserDto } from "../types/user.type.js";

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
    const user: CreateUserDto = req.body;
    this.authService.register(user)
      .then((registerResult: any) => {
        res.status(201).json({ id: registerResult.user.id, username: registerResult.user.username, token: registerResult.token });
      })
      .catch(error => {
        next(error)
      })
  }
}

const authController = AuthController.getInstance()

export default authController;