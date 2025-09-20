import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { userService } from '../../src/services/userService';
import { authService } from '../../src/services/authService';
import { UpdateUserRequest, User } from 'flixsync-shared-library';

vi.mock('../../src/services/userService');
vi.mock('../../src/services/authService');

describe('User Integration Tests', () => {
  let app: any;
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

  beforeEach(() => {
    app = createApp();
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

      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
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
      const response = await request(app)
        .get('/api/v1/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    it('should return 401 with invalid token', async () => {
      mockAuthService.verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer invalid-token`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired token');
    });

    it('should return 404 if user not found', async () => {
      mockUserService.getUserById.mockResolvedValueOnce(mockUser) // For auth middleware
                                   .mockResolvedValueOnce(null);  // For controller

      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('DELETE /api/v1/users/profile', () => {
    it('should delete user profile successfully', async () => {
      mockUserService.deleteUser.mockResolvedValue();

      const response = await request(app)
        .delete('/api/v1/users/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User account deleted successfully');
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('user-123');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    it('should handle delete service errors', async () => {
      mockUserService.deleteUser.mockRejectedValue(new Error('Delete failed'));

      const response = await request(app)
        .delete('/api/v1/users/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Delete failed');
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

      const response = await request(app)
        .get('/api/v1/users/target-user-456')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: 'target-user-456',
        username: 'targetuser',
        profile: expect.objectContaining({
          favoriteGenres: ['Sci-Fi']
        })
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users/target-user-456');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    it('should return 404 if target user not found', async () => {
      mockUserService.getUserById.mockResolvedValueOnce(mockUser) // For auth middleware
                                   .mockResolvedValueOnce(null);   // For controller

      const response = await request(app)
        .get('/api/v1/users/non-existent-user')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });
  });
});