import express from 'express';
import configuragion from './config/configuration.js';
import Logger from './modules/logger.js';
import HttpExceptionFilter from './middlewares/http-exception-filter.middleware.js';
import HttpException from './exceptions/http.exception.js';
import authRouter from './routes/auth.router.js';
import AuthGuard from './middlewares/auth-guard.middleware.js';

const logger = new Logger();
const app = express();

app.use(express.json());

app.get(`/`, (req, res, next) => {
  res.send('API Worked');
});
app.use('/auth', authRouter);

app.use((req, res, next) => {
  next(new HttpException('ExpressApplication', `Cannot ${req.method} ${req.path}`, 404));
});
app.use(HttpExceptionFilter);

const server = app.listen(configuragion.port, () => {
  logger.log('Express application started');
  logger.log(`PORT: ${configuragion.port}`);
});

process.on("unhandledRejection", (err: any) => {
  logger.error(`An error occurred: ${err?.message}`);
  server.close(() => process.exit(1))
})