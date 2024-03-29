import { NextFunction, Request, Response } from "express";
import HttpException from "../exceptions/http.exception.js";
import Logger from "../modules/logger.js";
import UnauthorizedException from "../exceptions/unauthorized.exception.js";

const HttpExceptionFilter = async (err: HttpException | Error, req: Request, res: Response, next: NextFunction) => {
  let status = 500;
  let message = 'Internal server error'
  let errors = null;
  if (err instanceof HttpException) {
    status = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  const exceptionResponse: any = {
    statusCode: status,
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    message: message
  }
  if (errors) {
    exceptionResponse.errors = errors;
  }

  
  if (exceptionResponse.message !== 'Unauthorized' && exceptionResponse.message !== `Cannot ${req.method} ${req.path}`) {
    const logger = new Logger(err.name)
    if (err instanceof HttpException) {
      logger.setProcessName(err.processName);
    } 
    logger.error(err.message, 'errors' in err ? err.errors : undefined);
  }

  res.status(status).json(exceptionResponse);
}

export default HttpExceptionFilter;