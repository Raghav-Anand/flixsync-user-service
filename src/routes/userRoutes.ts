import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { updateUserSchema } from '../middleware/validation';
import { AuthenticatedUser } from '../types/fastify';

interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

export const setupUserRoutes = async (app: FastifyInstance): Promise<void> => {
  // Get user profile
  app.get('/profile', {
    preHandler: authenticate,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return userController.getProfile(request as AuthenticatedRequest, reply);
    }
  });

  // Update user profile
  app.put('/profile', {
    preHandler: authenticate,
    schema: {
      body: updateUserSchema,
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return userController.updateProfile(request as AuthenticatedRequest, reply);
    }
  });

  // Delete user profile
  app.delete('/profile', {
    preHandler: authenticate,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return userController.deleteProfile(request as AuthenticatedRequest, reply);
    }
  });

  // Get user by ID
  app.get('/:userId', {
    preHandler: authenticate,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return userController.getUserById(request, reply);
    }
  });
};