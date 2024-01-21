import express from 'express';
import configuragion from './config/configuration.js';
import Logger from './modules/logger.js';
import HttpExceptionFilter from './middlewares/http-exception-filter.middleware.js';
import HttpException from './exceptions/HttpException.js';
import authRouter from './routes/auth.router.js';

const logger = new Logger();
const app = express();

app.use(express.json());

app.use('/auth', authRouter);
app.get(`/`, (req, res, next) => {
  res.send('API Worked');
});

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