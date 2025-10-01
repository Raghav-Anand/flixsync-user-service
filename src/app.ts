import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { config } from './config';
import { setupRoutes } from './routes';
import { setupErrorHandlers } from './middleware/errorHandler';

export const createApp = async (): Promise<FastifyInstance> => {
  const app = fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug',
    },
    bodyLimit: 10 * 1024 * 1024, // 10MB
  });

  // Register CORS plugin
  await app.register(cors, {
    origin: config.cors.allowedOrigins,
    credentials: true,
  });

  // Register Helmet plugin for security
  await app.register(helmet);

  // Register JWT plugin
  await app.register(jwt, {
    secret: config.jwt.secret,
  });

  // Setup routes
  await setupRoutes(app);

  // Setup error handlers
  setupErrorHandlers(app);

  return app;
};