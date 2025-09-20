import { Response } from 'express';
import { userService } from '../services/userService';
import { AuthenticatedRequest } from '../middleware/auth';
import { UpdateUserRequest } from '@flixsync/flixsync-shared-library';

export class UserController {
  public async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      const { passwordHash, ...publicUser } = user;

      res.status(200).json({
        success: true,
        data: publicUser,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  public async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const updateData: UpdateUserRequest = req.body;

      const updatedUser = await userService.updateUser(userId, updateData);

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  public async deleteProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      await userService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: 'User account deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  public async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const user = await userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      const { passwordHash, email, ...publicUser } = user;

      res.status(200).json({
        success: true,
        data: publicUser,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export const userController = new UserController();