import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../src/services/authService';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@flixsync/flixsync-shared-library';

vi.mock('jsonwebtoken');
vi.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  const mockJwt = jwt as any;
  const mockBcrypt = bcrypt as any;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await authService.hashPassword(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });

    it('should throw error if bcrypt fails', async () => {
      const password = 'testPassword123';

      mockBcrypt.hash.mockRejectedValue(new Error('Bcrypt error'));

      await expect(authService.hashPassword(password)).rejects.toThrow('Bcrypt error');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.compare.mockResolvedValue(true);

      const result = await authService.comparePassword(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.compare.mockResolvedValue(false);

      const result = await authService.comparePassword(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload', () => {
      const userId = 'user-123';
      const token = 'generated-access-token';

      mockJwt.sign.mockReturnValue(token);

      const result = authService.generateAccessToken(userId);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        { userId, type: 'access' },
        'test-jwt-secret-key-for-testing-purposes-only',
        { expiresIn: '15m' }
      );
      expect(result).toBe(token);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with correct payload', () => {
      const userId = 'user-123';
      const token = 'generated-refresh-token';

      mockJwt.sign.mockReturnValue(token);

      const result = authService.generateRefreshToken(userId);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        { userId, type: 'refresh' },
        'test-refresh-secret-key-for-testing-purposes-only',
        { expiresIn: '7d' }
      );
      expect(result).toBe(token);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = 'valid-access-token';
      const userId = 'user-123';
      const decodedPayload = { userId, type: 'access' };

      mockJwt.verify.mockReturnValue(decodedPayload);

      const result = authService.verifyAccessToken(token);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-jwt-secret-key-for-testing-purposes-only');
      expect(result).toEqual({ userId });
    });

    it('should throw error for invalid token type', () => {
      const token = 'invalid-token';
      const decodedPayload = { userId: 'user-123', type: 'refresh' };

      mockJwt.verify.mockReturnValue(decodedPayload);

      expect(() => authService.verifyAccessToken(token)).toThrow('Invalid or expired access token');
    });

    it('should throw error for invalid token', () => {
      const token = 'invalid-token';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.verifyAccessToken(token)).toThrow('Invalid or expired access token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = 'valid-refresh-token';
      const userId = 'user-123';
      const decodedPayload = { userId, type: 'refresh' };

      mockJwt.verify.mockReturnValue(decodedPayload);

      const result = authService.verifyRefreshToken(token);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-refresh-secret-key-for-testing-purposes-only');
      expect(result).toEqual({ userId });
    });

    it('should throw error for invalid token type', () => {
      const token = 'invalid-token';
      const decodedPayload = { userId: 'user-123', type: 'access' };

      mockJwt.verify.mockReturnValue(decodedPayload);

      expect(() => authService.verifyRefreshToken(token)).toThrow('Invalid or expired refresh token');
    });

    it('should throw error for invalid token', () => {
      const token = 'invalid-token';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.verifyRefreshToken(token)).toThrow('Invalid or expired refresh token');
    });
  });

  describe('createAuthResponse', () => {
    it('should create auth response with tokens', () => {
      const user: Omit<User, 'passwordHash'> = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        profile: {
          favoriteGenres: ['Action']
        },
        preferences: {
          language: 'en',
          region: 'US',
          adultContent: false,
          notifications: {
            newRecommendations: true,
            groupInvites: true,
            movieUpdates: false,
            email: true,
            push: false
          },
          privacy: {
            profileVisibility: 'public',
            ratingsVisibility: 'friends',
            allowGroupInvites: true
          }
        },
        streamingSubscriptions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      mockJwt.sign.mockReturnValueOnce(accessToken)
                  .mockReturnValueOnce(refreshToken);

      const result = authService.createAuthResponse(user);

      expect(result).toEqual({
        user,
        token: accessToken,
        refreshToken
      });
      expect(mockJwt.sign).toHaveBeenCalledTimes(2);
    });
  });
});