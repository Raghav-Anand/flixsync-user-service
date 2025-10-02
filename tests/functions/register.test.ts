import { describe, it, expect, beforeEach, vi } from 'vitest';
import { register } from '../../src/functions/register';
import { userService } from '../../src/services/userService';
import { HttpRequest, InvocationContext } from '@azure/functions';

vi.mock('../../src/services/userService');
vi.mock('../../src/config/database', () => ({
  getDbConnection: vi.fn().mockReturnValue({
    initialize: vi.fn().mockResolvedValue(undefined)
  })
}));

describe('Register Function', () => {
  let mockRequest: Partial<HttpRequest>;
  let mockContext: Partial<InvocationContext>;

  beforeEach(() => {
    mockContext = {
      log: vi.fn(),
      error: vi.fn(),
    };

    vi.clearAllMocks();
  });

  it('should register user successfully', async () => {
    const requestBody = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    };

    mockRequest = {
      json: vi.fn().mockResolvedValue(requestBody)
    };

    const mockAuthResponse = {
      user: { id: 'user-123', email: 'test@example.com', username: 'testuser' },
      token: 'access-token',
      refreshToken: 'refresh-token'
    };

    vi.mocked(userService.createUser).mockResolvedValue(mockAuthResponse);

    const response = await register(mockRequest as HttpRequest, mockContext as InvocationContext);

    expect(response.status).toBe(201);
    expect(response.jsonBody).toEqual({
      success: true,
      data: mockAuthResponse
    });
  });

  it('should return error if registration fails', async () => {
    const requestBody = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    };

    mockRequest = {
      json: vi.fn().mockResolvedValue(requestBody)
    };

    vi.mocked(userService.createUser).mockRejectedValue(new Error('Email already exists'));

    const response = await register(mockRequest as HttpRequest, mockContext as InvocationContext);

    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      success: false,
      error: 'Email already exists'
    });
  });
});
