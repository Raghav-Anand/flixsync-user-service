import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { User, AuthResponse } from '@flixsync/flixsync-shared-library';

export class AuthService {
  public async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  public generateAccessToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'access' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );
  }

  public generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as SignOptions
    );
  }

  public verifyAccessToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return { userId: decoded.userId };
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  public verifyRefreshToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as any;
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return { userId: decoded.userId };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  public createAuthResponse(user: Omit<User, 'passwordHash'>): AuthResponse {
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user,
      token: accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();