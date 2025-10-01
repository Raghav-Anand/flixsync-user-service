import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../../src/services/userService';
import { UserModel } from '../../src/models/User';
import { authService } from '../../src/services/authService';
import * as database from '../../src/config/database';
import { User, CreateUserRequest, UpdateUserRequest, LoginRequest } from '@flixsync/flixsync-shared-library';

vi.mock('../../src/models/User');
vi.mock('../../src/services/authService');
vi.mock('../../src/config/database');
vi.mock('uuid', () => ({ v4: vi.fn(() => 'mock-uuid-123') }));

describe('UserService', () => {
  let userService: UserService;
  let mockContainer: any;
  let mockAuthService: any;
  let mockUserModel: any;

  beforeEach(() => {
    userService = new UserService();

    mockContainer = {
      items: {
        create: vi.fn(),
        query: vi.fn().mockReturnValue({
          fetchAll: vi.fn()
        })
      },
      item: vi.fn().mockReturnValue({
        read: vi.fn(),
        replace: vi.fn(),
        delete: vi.fn()
      })
    };

    vi.spyOn(database, 'getDbConnection').mockReturnValue({
      getContainer: vi.fn().mockReturnValue(mockContainer),
      getDatabase: vi.fn(),
      initialize: vi.fn()
    } as any);

    mockAuthService = authService as any;
    mockUserModel = UserModel as any;

    vi.clearAllMocks();
  });

  describe('createUser', () => {
    const mockCreateUserRequest: CreateUserRequest = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      profile: {
        favoriteGenres: ['Action']
      }
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashed-password';
      const mockCreatedUser = {
        id: 'mock-uuid-123',
        email: 'test@example.com',
        username: 'testuser'
      };
      const mockPublicUser = { id: 'mock-uuid-123', email: 'test@example.com' };
      const mockAuthResponse = {
        user: mockPublicUser,
        token: 'access-token',
        refreshToken: 'refresh-token'
      };

      mockContainer.items.query().fetchAll.mockResolvedValue({ resources: [] });
      mockAuthService.hashPassword.mockResolvedValue(hashedPassword);
      mockContainer.items.create.mockResolvedValue({ resource: mockCreatedUser });

      const mockUserModelInstance = {
        toJSON: vi.fn().mockReturnValue(mockCreatedUser),
        toPublicJSON: vi.fn().mockReturnValue(mockPublicUser)
      };
      mockUserModel.mockReturnValue(mockUserModelInstance);

      mockAuthService.createAuthResponse.mockReturnValue(mockAuthResponse);

      const result = await userService.createUser(mockCreateUserRequest);

      expect(mockAuthService.hashPassword).toHaveBeenCalledWith('password123');
      expect(mockContainer.items.create).toHaveBeenCalled();
      expect(mockAuthService.createAuthResponse).toHaveBeenCalledWith(mockPublicUser);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error if email already exists', async () => {
      const existingUser = { id: 'existing-user', email: 'test@example.com' };
      mockContainer.items.query().fetchAll.mockResolvedValue({ resources: [existingUser] });

      await expect(userService.createUser(mockCreateUserRequest)).rejects.toThrow('User with this email already exists');
    });

    it('should throw error if username already taken', async () => {
      mockContainer.items.query().fetchAll
        .mockResolvedValueOnce({ resources: [] }) // email check
        .mockResolvedValueOnce({ resources: [{ id: 'existing-user', username: 'testuser' }] }); // username check

      await expect(userService.createUser(mockCreateUserRequest)).rejects.toThrow('Username is already taken');
    });

    it('should throw error if user creation fails', async () => {
      mockContainer.items.query().fetchAll.mockResolvedValue({ resources: [] });
      mockAuthService.hashPassword.mockResolvedValue('hashed-password');
      mockContainer.items.create.mockResolvedValue({ resource: null });

      const mockUserModelInstance = {
        toJSON: vi.fn().mockReturnValue({}),
        toPublicJSON: vi.fn().mockReturnValue({})
      };
      mockUserModel.mockReturnValue(mockUserModelInstance);

      await expect(userService.createUser(mockCreateUserRequest)).rejects.toThrow('Failed to create user');
    });
  });

  describe('loginUser', () => {
    const mockLoginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password'
      };
      const mockPublicUser = { id: 'user-123', email: 'test@example.com' };
      const mockAuthResponse = {
        user: mockPublicUser,
        token: 'access-token',
        refreshToken: 'refresh-token'
      };

      mockContainer.items.query().fetchAll.mockResolvedValue({ resources: [mockUser] });
      mockAuthService.comparePassword.mockResolvedValue(true);

      const mockUserModelInstance = {
        toPublicJSON: vi.fn().mockReturnValue(mockPublicUser)
      };
      mockUserModel.mockReturnValue(mockUserModelInstance);
      mockAuthService.createAuthResponse.mockReturnValue(mockAuthResponse);

      const result = await userService.loginUser(mockLoginRequest);

      expect(mockAuthService.comparePassword).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error if user not found', async () => {
      mockContainer.items.query().fetchAll.mockResolvedValue({ resources: [] });

      await expect(userService.loginUser(mockLoginRequest)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error if password is invalid', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password'
      };

      mockContainer.items.query().fetchAll.mockResolvedValue({ resources: [mockUser] });
      mockAuthService.comparePassword.mockResolvedValue(false);

      await expect(userService.loginUser(mockLoginRequest)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockContainer.item().read.mockResolvedValue({ resource: mockUser });

      const result = await userService.getUserById('user-123');

      expect(mockContainer.item).toHaveBeenCalledWith('user-123', 'user-123');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const error = new Error('Not found');
      (error as any).code = 404;
      mockContainer.item().read.mockRejectedValue(error);

      const result = await userService.getUserById('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error for other database errors', async () => {
      const error = new Error('Database error');
      (error as any).code = 500;
      mockContainer.item().read.mockRejectedValue(error);

      await expect(userService.getUserById('user-123')).rejects.toThrow('Database error');
    });
  });

  describe('updateUser', () => {
    const mockUpdateRequest: UpdateUserRequest = {
      profile: {
        firstName: 'John',
        favoriteGenres: ['Drama']
      }
    };

    it('should update user successfully', async () => {
      const mockExistingUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser'
      };
      const mockUpdatedUser = {
        ...mockExistingUser,
        ...mockUpdateRequest
      };
      const mockPublicUser = { id: 'user-123', email: 'test@example.com' };

      mockContainer.item().read.mockResolvedValue({ resource: mockExistingUser });
      mockContainer.item().replace.mockResolvedValue({ resource: mockUpdatedUser });

      const mockUserModelInstance = {
        toJSON: vi.fn().mockReturnValue(mockUpdatedUser),
        toPublicJSON: vi.fn().mockReturnValue(mockPublicUser)
      };
      mockUserModel.mockReturnValue(mockUserModelInstance);

      const result = await userService.updateUser('user-123', mockUpdateRequest);

      expect(mockContainer.item().replace).toHaveBeenCalled();
      expect(result).toEqual(mockPublicUser);
    });

    it('should throw error if user not found', async () => {
      const error = new Error('Not found');
      (error as any).code = 404;
      mockContainer.item().read.mockRejectedValue(error);

      await expect(userService.updateUser('non-existent', mockUpdateRequest)).rejects.toThrow('User not found');
    });

    it('should throw error if update fails', async () => {
      const mockExistingUser = { id: 'user-123', email: 'test@example.com' };
      mockContainer.item().read.mockResolvedValue({ resource: mockExistingUser });
      mockContainer.item().replace.mockResolvedValue({ resource: null });

      const mockUserModelInstance = {
        toJSON: vi.fn().mockReturnValue({}),
        toPublicJSON: vi.fn().mockReturnValue({})
      };
      mockUserModel.mockReturnValue(mockUserModelInstance);

      await expect(userService.updateUser('user-123', mockUpdateRequest)).rejects.toThrow('Failed to update user');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockContainer.item().read.mockResolvedValue({ resource: mockUser });
      mockContainer.item().delete.mockResolvedValue({});

      await userService.deleteUser('user-123');

      expect(mockContainer.item().delete).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      const error = new Error('Not found');
      (error as any).code = 404;
      mockContainer.item().read.mockRejectedValue(error);

      await expect(userService.deleteUser('non-existent')).rejects.toThrow('User not found');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockPublicUser = { id: 'user-123', email: 'test@example.com' };
      const mockAuthResponse = {
        user: mockPublicUser,
        token: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      mockAuthService.verifyRefreshToken.mockReturnValue({ userId: 'user-123' });
      mockContainer.item().read.mockResolvedValue({ resource: mockUser });

      const mockUserModelInstance = {
        toPublicJSON: vi.fn().mockReturnValue(mockPublicUser)
      };
      mockUserModel.mockReturnValue(mockUserModelInstance);
      mockAuthService.createAuthResponse.mockReturnValue(mockAuthResponse);

      const result = await userService.refreshToken(refreshToken);

      expect(mockAuthService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error if refresh token is invalid', async () => {
      const refreshToken = 'invalid-token';
      mockAuthService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid refresh token');
      });

      await expect(userService.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error if user not found', async () => {
      const refreshToken = 'valid-refresh-token';
      mockAuthService.verifyRefreshToken.mockReturnValue({ userId: 'user-123' });

      const error = new Error('Not found');
      (error as any).code = 404;
      mockContainer.item().read.mockRejectedValue(error);

      await expect(userService.refreshToken(refreshToken)).rejects.toThrow('User not found');
    });
  });
});