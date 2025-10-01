import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/userService';
import { UpdateUserRequest } from '@flixsync/flixsync-shared-library';
import { AuthenticatedUser } from '../types/fastify';

interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

export class UserController {
  public async getProfile(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = request.user.id;
      const user = await userService.getUserById(userId);

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found',
        });
      }

      const { passwordHash, ...publicUser } = user;

      return reply.status(200).send({
        success: true,
        data: publicUser,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  public async updateProfile(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = request.user.id;
      const updateData: UpdateUserRequest = request.body as UpdateUserRequest;

      const updatedUser = await userService.updateUser(userId, updateData);

      return reply.status(200).send({
        success: true,
        data: updatedUser,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }
  }

  public async deleteProfile(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = request.user.id;
      await userService.deleteUser(userId);

      return reply.status(200).send({
        success: true,
        message: 'User account deleted successfully',
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }
  }

  public async getUserById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { userId } = request.params as { userId: string };
      const user = await userService.getUserById(userId);

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found',
        });
      }

      const { passwordHash, email, ...publicUser } = user;

      return reply.status(200).send({
        success: true,
        data: publicUser,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  }
}

export const userController = new UserController();