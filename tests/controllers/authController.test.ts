import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { AuthController } from '../../src/controllers/authController';
import { userService } from '../../src/services/userService';
import { CreateUserRequest, LoginRequest, AuthResponse } from 'flixsync-shared-library';

vi.mock('../../src/services/userService');

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserService: any;

  beforeEach(() => {
    authController = new AuthController();
    mockUserService = userService as any;

    mockRequest = {
      body: {}
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const createUserRequest: CreateUserRequest = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };

      const mockAuthResponse: AuthResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
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
        },
        token: 'access-token',
        refreshToken: 'refresh-token'
      };

      mockRequest.body = createUserRequest;
      mockUserService.createUser.mockResolvedValue(mockAuthResponse);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.createUser).toHaveBeenCalledWith(createUserRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAuthResponse
      });
    });

    it('should handle registration errors', async () => {
      const createUserRequest: CreateUserRequest = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };

      mockRequest.body = createUserRequest;
      mockUserService.createUser.mockRejectedValue(new Error('Email already exists'));

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email already exists'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockAuthResponse: AuthResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
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
        },
        token: 'access-token',
        refreshToken: 'refresh-token'
      };

      mockRequest.body = loginRequest;
      mockUserService.loginUser.mockResolvedValue(mockAuthResponse);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.loginUser).toHaveBeenCalledWith(loginRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAuthResponse
      });
    });

    it('should handle login errors', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockRequest.body = loginRequest;
      mockUserService.loginUser.mockRejectedValue(new Error('Invalid email or password'));

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid email or password'
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockAuthResponse: AuthResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
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
        },
        token: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      mockRequest.body = { refreshToken };
      mockUserService.refreshToken.mockResolvedValue(mockAuthResponse);

      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAuthResponse
      });
    });

    it('should handle refresh token errors', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockRequest.body = { refreshToken };
      mockUserService.refreshToken.mockRejectedValue(new Error('Invalid refresh token'));

      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid refresh token'
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await authController.logout(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully'
      });
    });
  });
});