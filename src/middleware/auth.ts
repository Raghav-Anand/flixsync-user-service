import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { AuthenticatedUser } from '../types/fastify';

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const { userId } = authService.verifyAccessToken(token);

    const user = await userService.getUserById(userId);
    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }

    request.user = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return;
    }

    const token = authHeader.substring(7);
    const { userId } = authService.verifyAccessToken(token);

    const user = await userService.getUserById(userId);
    if (user) {
      request.user = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
    }
  } catch (error) {
    // Continue without authentication
  }
};