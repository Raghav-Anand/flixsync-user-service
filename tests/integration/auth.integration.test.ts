import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createApp } from '../../src/app';
import { userService } from '../../src/services/userService';
import { authService } from '../../src/services/authService';
import { CreateUserRequest, LoginRequest, AuthResponse } from '@flixsync/flixsync-shared-library';

vi.mock('../../src/services/userService');
vi.mock('../../src/services/authService');

describe('Auth Integration Tests', () => {
  let app: FastifyInstance;
  let mockUserService: any;
  let mockAuthService: any;

  beforeEach(async () => {
    app = await createApp();
    await app.ready();
    mockUserService = userService as any;
    mockAuthService = authService as any;
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    const validCreateUserRequest: CreateUserRequest = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'StrongPassword123!'
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

    it('should register user successfully', async () => {
      mockUserService.createUser.mockResolvedValue(mockAuthResponse);

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: validCreateUserRequest
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        user: expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser'
        }),
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      expect(mockUserService.createUser).toHaveBeenCalledWith(validCreateUserRequest);
    });

    it('should return 400 if user already exists', async () => {
      mockUserService.createUser.mockRejectedValue(new Error('User with this email already exists'));

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: validCreateUserRequest
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('User with this email already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const validLoginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'StrongPassword123!'
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

    it('should login user successfully', async () => {
      mockUserService.loginUser.mockResolvedValue(mockAuthResponse);

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: validLoginRequest
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        user: expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser'
        }),
        token: 'access-token',
        refreshToken: 'refresh-token'
      });
      expect(mockUserService.loginUser).toHaveBeenCalledWith(validLoginRequest);
    });

    it('should return 401 for invalid credentials', async () => {
      mockUserService.loginUser.mockRejectedValue(new Error('Invalid email or password'));

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: validLoginRequest
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Invalid email or password');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Logged out successfully');
    });
  });
});