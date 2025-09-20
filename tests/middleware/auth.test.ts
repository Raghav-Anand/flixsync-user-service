import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Response, NextFunction } from 'express';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../../src/middleware/auth';
import { authService } from '../../src/services/authService';
import { userService } from '../../src/services/userService';
import { User } from 'flixsync-shared-library';

vi.mock('../../src/services/authService');
vi.mock('../../src/services/userService');

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockAuthService: any;
  let mockUserService: any;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    mockNext = vi.fn();
    mockAuthService = authService as any;
    mockUserService = userService as any;

    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid token', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed-password',
        profile: { favoriteGenres: [] },
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

      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      mockAuthService.verifyAccessToken.mockReturnValue({ userId: 'user-123' });
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockUserService.getUserById).toHaveBeenCalledWith('user-123');
      expect(mockRequest.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser'
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if no authorization header', async () => {
      mockRequest.headers = {};

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', async () => {
      mockRequest.headers = {
        authorization: 'Basic invalid-auth'
      };

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      mockAuthService.verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      mockAuthService.verifyAccessToken.mockReturnValue({ userId: 'user-123' });
      mockUserService.getUserById.mockResolvedValue(null);

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should authenticate user with valid token', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed-password',
        profile: { favoriteGenres: [] },
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

      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      mockAuthService.verifyAccessToken.mockReturnValue({ userId: 'user-123' });
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockUserService.getUserById).toHaveBeenCalledWith('user-123');
      expect(mockRequest.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser'
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user if no authorization header', async () => {
      mockRequest.headers = {};

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without user if authorization header does not start with Bearer', async () => {
      mockRequest.headers = {
        authorization: 'Basic invalid-auth'
      };

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without user if token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      mockAuthService.verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without user if user not found but token is valid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      mockAuthService.verifyAccessToken.mockReturnValue({ userId: 'user-123' });
      mockUserService.getUserById.mockResolvedValue(null);

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});