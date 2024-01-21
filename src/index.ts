import express, { NextFunction, Request, Response } from 'express';
import configuragion from './config/configuration.js';
import mongoose from 'mongoose';
import dbConfig from './config/database.js';
import Logger from './modules/logger.js';
import HttpExceptionFilter from './middlewares/http-exception-filter.middleware.js';
import HttpException from './exceptions/HttpException.js';
import UserService from './services/user.service.js';
import authRouter from './routes/auth.router.js';

const logger = new Logger();

const app = express();

app.use('/auth', authRouter);

app.get(`/`, (req, res, next) => {
  res.send('API Worked');
});

const server = app.listen(configuragion.port, () => {
  logger.log('Express application started');
  logger.log(`PORT: ${configuragion.port}`);
});

app.use(HttpExceptionFilter);

process.on("unhandledRejection", (err: any) => {
  logger.error(`An error occurred: ${err?.message}`);
  server.close(() => process.exit(1))
})