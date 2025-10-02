import { HttpRequest } from '@azure/functions';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
}

export async function authenticateRequest(request: HttpRequest): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Access token required');
  }

  const token = authHeader.substring(7);
  const { userId } = authService.verifyAccessToken(token);

  const user = await userService.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
  };
}
