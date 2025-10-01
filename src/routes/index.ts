import { FastifyInstance } from 'fastify';
import { setupAuthRoutes } from './authRoutes';
import { setupUserRoutes } from './userRoutes';

export const setupRoutes = async (app: FastifyInstance): Promise<void> => {
  // Health check route
  app.get('/api/v1/health', async (request, reply) => {
    return reply.status(200).send({
      success: true,
      message: 'User service is healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // Register route modules
  await app.register(setupAuthRoutes, { prefix: '/api/v1/auth' });
  await app.register(setupUserRoutes, { prefix: '/api/v1/users' });
};