import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { CreateUserRequest, LoginRequest } from 'flixsync-shared-library';

export class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      const authResponse = await userService.createUser(userData);

      res.status(201).json({
        success: true,
        data: authResponse,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      const authResponse = await userService.loginUser(loginData);

      res.status(200).json({
        success: true,
        data: authResponse,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const authResponse = await userService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: authResponse,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}

export const authController = new AuthController();