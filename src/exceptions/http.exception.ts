class HttpException extends Error {
  public processName: string;
  public message: string;
  public statusCode: number;
  public errors: object | null;

  constructor(processName: string, message: string = 'Internal server error', statusCode: number = 500, errors: object | null = null) {
    super(message);
    this.processName = processName;
    this.message = message;
    this.statusCode = statusCode;
    this.name = 'HttpException';
    this.errors = errors;
    
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}

export default HttpException;