import HttpException from "./http.exception.js";

class UnauthorizedException extends HttpException {
  constructor(processName: string, message: string = 'Unauthorized', statusCode: number = 401, errors: object | null = null) {
    super(processName, message, statusCode, errors);
    this.name = 'UnauthorizedException';
  }
}

export default UnauthorizedException;
