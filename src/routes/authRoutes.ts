import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authController } from '../controllers/authController';
import { createUserSchema, loginSchema, refreshTokenSchema } from '../middleware/validation';

export const setupAuthRoutes = async (app: FastifyInstance): Promise<void> => {
  // Register route
  app.post('/register', {
    schema: {
      body: createUserSchema,
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return authController.register(request, reply);
    }
  });

  // Login route
  app.post('/login', {
    schema: {
      body: loginSchema,
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return authController.login(request, reply);
    }
  });

  // Refresh token route
  app.post('/refresh', {
    schema: {
      body: refreshTokenSchema,
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return authController.refreshToken(request, reply);
    }
  });

  // Logout route
  app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    return authController.logout(request, reply);
  });
};