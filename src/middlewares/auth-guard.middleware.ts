import { NextFunction, Request, Response } from "express";
import UnauthorizedException from "../exceptions/unauthorized.exception.js";
import jwt from "jsonwebtoken";
import configuragion from "../config/configuration.js";
import { AuthRequest } from "../types/auth.type.js";

const AuthGuard = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = extractTokenFromHeader(req);
  if (!token) {
    throw new UnauthorizedException('AuthGuard');
  }

  try {
    const payload = jwt.verify(token, configuragion.jwt_secret);   
    req['user'] = payload;
    next();
  } catch (error) {
    throw new UnauthorizedException('AuthGuard');
  }
}

function extractTokenFromHeader(request: Request): string | undefined {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}

export default AuthGuard;