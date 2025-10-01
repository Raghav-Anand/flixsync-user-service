import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/userService';
import { CreateUserRequest, LoginRequest } from '@flixsync/flixsync-shared-library';

export class AuthController {
  public async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userData: CreateUserRequest = request.body as CreateUserRequest;
      const authResponse = await userService.createUser(userData);

      return reply.status(201).send({
        success: true,
        data: authResponse,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }
  }

  public async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const loginData: LoginRequest = request.body as LoginRequest;
      const authResponse = await userService.loginUser(loginData);

      return reply.status(200).send({
        success: true,
        data: authResponse,
      });
    } catch (error: any) {
      return reply.status(401).send({
        success: false,
        error: error.message,
      });
    }
  }

  public async refreshToken(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { refreshToken } = request.body as { refreshToken: string };
      const authResponse = await userService.refreshToken(refreshToken);

      return reply.status(200).send({
        success: true,
        data: authResponse,
      });
    } catch (error: any) {
      return reply.status(401).send({
        success: false,
        error: error.message,
      });
    }
  }

  public async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    return reply.status(200).send({
      success: true,
      message: 'Logged out successfully',
    });
  }
}

export const authController = new AuthController();