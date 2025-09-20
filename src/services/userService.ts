import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/User';
import { authService } from './authService';
import { dbConnection } from '../config/database';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  AuthResponse
} from 'flixsync-shared-library';

export class UserService {
  private get container() {
    return dbConnection.getContainer();
  }

  public async createUser(userData: CreateUserRequest): Promise<AuthResponse> {
    const existingUser = await this.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await this.findUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    const hashedPassword = await authService.hashPassword(userData.password);

    const newUser = new UserModel({
      id: uuidv4(),
      email: userData.email.toLowerCase(),
      username: userData.username,
      passwordHash: hashedPassword,
      streamingSubscriptions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(userData.profile && { profile: userData.profile }),
      ...(userData.preferences && { preferences: userData.preferences }),
    });

    const { resource } = await this.container.items.create(newUser.toJSON());

    if (!resource) {
      throw new Error('Failed to create user');
    }

    const publicUser = new UserModel(resource).toPublicJSON();
    return authService.createAuthResponse(publicUser);
  }

  public async loginUser(loginData: LoginRequest): Promise<AuthResponse> {
    const user = await this.findUserByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await authService.comparePassword(
      loginData.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const publicUser = new UserModel(user).toPublicJSON();
    return authService.createAuthResponse(publicUser);
  }

  public async getUserById(userId: string): Promise<User | null> {
    try {
      const { resource } = await this.container.item(userId, userId).read<User>();
      return resource || null;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  public async updateUser(userId: string, updateData: UpdateUserRequest): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser = new UserModel({
      ...existingUser,
      ...updateData,
      id: existingUser.id,
      updatedAt: new Date(),
    });

    const { resource } = await this.container
      .item(userId, userId)
      .replace(updatedUser.toJSON());

    if (!resource) {
      throw new Error('Failed to update user');
    }

    return updatedUser.toPublicJSON();
  }

  public async deleteUser(userId: string): Promise<void> {
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    await this.container.item(userId, userId).delete();
  }

  public async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { userId } = authService.verifyRefreshToken(refreshToken);

    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const publicUser = new UserModel(user).toPublicJSON();
    return authService.createAuthResponse(publicUser);
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: email.toLowerCase() }],
    };

    const { resources } = await this.container.items.query<User>(querySpec).fetchAll();
    return resources.length > 0 ? resources[0] : null;
  }

  private async findUserByUsername(username: string): Promise<User | null> {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.username = @username',
      parameters: [{ name: '@username', value: username }],
    };

    const { resources } = await this.container.items.query<User>(querySpec).fetchAll();
    return resources.length > 0 ? resources[0] : null;
  }
}

export const userService = new UserService();