import { formatDate } from "./format-date.js";

class Logger {
  private processName: string;
  constructor(processName: string = 'ExpressApplication') {
    this.processName = processName;
  }

  setProcessName(processName: string) {
    this.processName = processName;
  }

  getProcessName() {
    return this.processName;
  }

  private getFormatedDate() {
    return formatDate(Date.now(), 'MONTH dd HH:mm:ss', 3);
  }

  private colorLogger = {
    'default': '\x1b[39m',
    'gray': '\x1b[90m',
    'yellow': '\x1b[33m',
    'log': '\x1b[32m',
    'error': '\x1b[31m',
    'info': '\x1b[90m',
    'debug': '\x1b[34m'
  }

  log(message: any, context?: any) {
    console.log(`${this.colorLogger.gray}${this.getFormatedDate()} ${this.colorLogger.log}[Express]    LOG ${this.colorLogger.yellow}[${this.processName}]${this.colorLogger.log} ${message}`);
    if (context) {
      console.log(`${this.colorLogger.gray}${this.getFormatedDate()} ${this.colorLogger.log}[Express]    LOG ${this.colorLogger.yellow}[${this.processName}]${this.colorLogger.log}`, context);
    }
  }

  error(message: any, context?: any, stack?: any) {
    console.error(`${this.colorLogger.gray}${this.getFormatedDate()} ${this.colorLogger.error}[Express]  Error ${this.colorLogger.yellow}[${this.processName}]${this.colorLogger.error} ${message}`);
    if (context) {
      console.error(`${this.colorLogger.gray}${this.getFormatedDate()} ${this.colorLogger.error}[Express]  Error ${this.colorLogger.yellow}[${this.processName}]${this.colorLogger.default}`, context);
    }
    if (stack) {
      console.error(`${this.colorLogger.gray}${this.getFormatedDate()} ${this.colorLogger.error}[Express]  Error ${this.colorLogger.yellow}[${this.processName}]${this.colorLogger.default}`, stack);
    }
  }
  
  errorStack(stack: any) {
    console.error(`${this.colorLogger.gray}${this.getFormatedDate()} ${this.colorLogger.error}[Express]  Error ${this.colorLogger.yellow}[${this.processName}]${this.colorLogger.default}`, stack);
  }

  info(message: any, context?: any) {
    console.info(`${this.colorLogger.gray}${this.getFormatedDate()} ${this.colorLogger.info}[Express]   INFO ${this.colorLogger.yellow}[${this.processName}]${this.colorLogger.info} ${message}`);
    if (context) {
      console.info(`${this.colorLogger.gray}${this.getFormatedDate()} ${this.colorLogger.info}[Express]   INFO ${this.colorLogger.yellow}[${this.processName}]${this.colorLogger.info}`, context);
    }
  }
}

export default Logger;