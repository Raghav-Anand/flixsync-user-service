import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Response } from 'express';
import { UserController } from '../../src/controllers/userController';
import { userService } from '../../src/services/userService';
import { AuthenticatedRequest } from '../../src/middleware/auth';
import { UpdateUserRequest, User } from 'flixsync-shared-library';

vi.mock('../../src/services/userService');

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockUserService: any;

  beforeEach(() => {
    userController = new UserController();
    mockUserService = userService as any;

    mockRequest = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser'
      },
      body: {},
      params: {}
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    vi.clearAllMocks();
  });

  describe('getProfile', () => {
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

    it('should return user profile successfully', async () => {
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await userController.getProfile(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      const { passwordHash, ...expectedUser } = mockUser;

      expect(mockUserService.getUserById).toHaveBeenCalledWith('user-123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedUser
      });
    });

    it('should return 404 if user not found', async () => {
      mockUserService.getUserById.mockResolvedValue(null);

      await userController.getProfile(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });

    it('should handle service errors', async () => {
      mockUserService.getUserById.mockRejectedValue(new Error('Database error'));

      await userController.getProfile(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error'
      });
    });
  });

  describe('updateProfile', () => {
    const updateData: UpdateUserRequest = {
      profile: {
        firstName: 'Jane',
        lastName: 'Smith',
        favoriteGenres: ['Drama', 'Thriller']
      },
      preferences: {
        language: 'es',
        region: 'ES',
        adultContent: true
      }
    };

    const updatedUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      profile: updateData.profile,
      preferences: {
        language: 'es',
        region: 'ES',
        adultContent: true,
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

    it('should update user profile successfully', async () => {
      mockRequest.body = updateData;
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      await userController.updateProfile(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockUserService.updateUser).toHaveBeenCalledWith('user-123', updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedUser
      });
    });

    it('should handle update errors', async () => {
      mockRequest.body = updateData;
      mockUserService.updateUser.mockRejectedValue(new Error('Update failed'));

      await userController.updateProfile(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Update failed'
      });
    });
  });

  describe('deleteProfile', () => {
    it('should delete user profile successfully', async () => {
      mockUserService.deleteUser.mockResolvedValue();

      await userController.deleteProfile(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockUserService.deleteUser).toHaveBeenCalledWith('user-123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User account deleted successfully'
      });
    });

    it('should handle delete errors', async () => {
      mockUserService.deleteUser.mockRejectedValue(new Error('Delete failed'));

      await userController.deleteProfile(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Delete failed'
      });
    });
  });

  describe('getUserById', () => {
    const mockUser: User = {
      id: 'target-user-456',
      email: 'target@example.com',
      username: 'targetuser',
      passwordHash: 'hashed-password',
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

    it('should return user by ID successfully', async () => {
      mockRequest.params = { userId: 'target-user-456' };
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      const { passwordHash, email, ...expectedUser } = mockUser;

      expect(mockUserService.getUserById).toHaveBeenCalledWith('target-user-456');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedUser
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { userId: 'non-existent-user' };
      mockUserService.getUserById.mockResolvedValue(null);

      await userController.getUserById(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { userId: 'target-user-456' };
      mockUserService.getUserById.mockRejectedValue(new Error('Database error'));

      await userController.getUserById(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error'
      });
    });
  });
});