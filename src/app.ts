import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { routes } from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export const createApp = (): express.Application => {
  const app = express();

  app.use(helmet());

  app.use(cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use('/api/v1', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};