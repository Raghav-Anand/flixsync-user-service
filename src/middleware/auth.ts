import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const token = authHeader.substring(7);
    const { userId } = authService.verifyAccessToken(token);

    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const { userId } = authService.verifyAccessToken(token);

    const user = await userService.getUserById(userId);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
    }

    next();
  } catch (error) {
    next();
  }
};