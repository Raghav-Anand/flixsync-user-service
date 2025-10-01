import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createApp } from '../../src/app';
import { userService } from '../../src/services/userService';
import { authService } from '../../src/services/authService';
import { UpdateUserRequest, User } from '@flixsync/flixsync-shared-library';

vi.mock('../../src/services/userService');
vi.mock('../../src/services/authService');

describe('User Integration Tests', () => {
  let app: FastifyInstance;
  let mockUserService: any;
  let mockAuthService: any;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashed-password',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      favoriteGenres: ['Action', 'Comedy']
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

  const validToken = 'valid-jwt-token';

  beforeEach(async () => {
    app = await createApp();
    await app.ready();
    mockUserService = userService as any;
    mockAuthService = authService as any;

    // Mock successful authentication
    mockAuthService.verifyAccessToken.mockReturnValue({ userId: 'user-123' });
    mockUserService.getUserById.mockResolvedValue(mockUser);

    vi.clearAllMocks();
  });

  describe('GET /api/v1/users/profile', () => {
    it('should get user profile successfully', async () => {
      const { passwordHash, ...expectedUser } = mockUser;

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          authorization: `Bearer ${validToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        profile: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe'
        })
      });
      expect(mockUserService.getUserById).toHaveBeenCalledWith('user-123');
    });

    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile'
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Access token required');
    });

    it('should return 401 with invalid token', async () => {
      mockAuthService.verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          authorization: `Bearer invalid-token`
        }
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Invalid or expired token');
    });

    it('should return 404 if user not found', async () => {
      mockUserService.getUserById.mockResolvedValueOnce(mockUser) // For auth middleware
                                   .mockResolvedValueOnce(null);  // For controller

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/profile',
        headers: {
          authorization: `Bearer ${validToken}`
        }
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('User not found');
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    const validUpdateRequest: UpdateUserRequest = {
      profile: {
        firstName: 'Jane',
        lastName: 'Doe',
        bio: 'Updated bio'
      }
    };

    it('should update user profile successfully', async () => {
      const updatedUser = { ...mockUser, profile: { ...mockUser.profile, ...validUpdateRequest.profile } };
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/users/profile',
        headers: {
          authorization: `Bearer ${validToken}`
        },
        payload: validUpdateRequest
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.profile.firstName).toBe('Jane');
      expect(mockUserService.updateUser).toHaveBeenCalledWith('user-123', validUpdateRequest);
    });

    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/users/profile',
        payload: validUpdateRequest
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Access token required');
    });

    it('should handle update service errors', async () => {
      mockUserService.updateUser.mockRejectedValue(new Error('Update failed'));

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/users/profile',
        headers: {
          authorization: `Bearer ${validToken}`
        },
        payload: validUpdateRequest
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Update failed');
    });
  });

  describe('DELETE /api/v1/users/profile', () => {
    it('should delete user profile successfully', async () => {
      mockUserService.deleteUser.mockResolvedValue();

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/v1/users/profile',
        headers: {
          authorization: `Bearer ${validToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('User account deleted successfully');
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('user-123');
    });

    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/v1/users/profile'
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Access token required');
    });

    it('should handle delete service errors', async () => {
      mockUserService.deleteUser.mockRejectedValue(new Error('Delete failed'));

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/v1/users/profile',
        headers: {
          authorization: `Bearer ${validToken}`
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Delete failed');
    });
  });

  describe('GET /api/v1/users/:userId', () => {
    const targetUser: User = {
      id: 'target-user-456',
      email: 'target@example.com',
      username: 'targetuser',
      passwordHash: 'hashed-password',
      profile: {
        favoriteGenres: ['Sci-Fi']
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

    it('should get user by ID successfully', async () => {
      mockUserService.getUserById.mockResolvedValueOnce(mockUser)    // For auth middleware
                                   .mockResolvedValueOnce(targetUser); // For controller

      const { passwordHash, email, ...expectedUser } = targetUser;

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/target-user-456',
        headers: {
          authorization: `Bearer ${validToken}`
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        id: 'target-user-456',
        username: 'targetuser',
        profile: expect.objectContaining({
          favoriteGenres: ['Sci-Fi']
        })
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/target-user-456'
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Access token required');
    });

    it('should return 404 if target user not found', async () => {
      mockUserService.getUserById.mockResolvedValueOnce(mockUser) // For auth middleware
                                   .mockResolvedValueOnce(null);   // For controller

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/non-existent-user',
        headers: {
          authorization: `Bearer ${validToken}`
        }
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('User not found');
    });
  });
});