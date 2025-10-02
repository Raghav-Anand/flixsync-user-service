import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login } from '../../src/functions/login';
import { userService } from '../../src/services/userService';
import { HttpRequest, InvocationContext } from '@azure/functions';

vi.mock('../../src/services/userService');
vi.mock('../../src/config/database', () => ({
  getDbConnection: vi.fn().mockReturnValue({
    initialize: vi.fn().mockResolvedValue(undefined)
  })
}));

describe('Login Function', () => {
  let mockRequest: Partial<HttpRequest>;
  let mockContext: Partial<InvocationContext>;

  beforeEach(() => {
    mockContext = {
      log: vi.fn(),
      error: vi.fn(),
    };

    vi.clearAllMocks();
  });

  it('should login user successfully', async () => {
    const requestBody = {
      email: 'test@example.com',
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

    vi.mocked(userService.loginUser).mockResolvedValue(mockAuthResponse);

    const response = await login(mockRequest as HttpRequest, mockContext as InvocationContext);

    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      success: true,
      data: mockAuthResponse
    });
  });

  it('should return 401 for invalid credentials', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    mockRequest = {
      json: vi.fn().mockResolvedValue(requestBody)
    };

    vi.mocked(userService.loginUser).mockRejectedValue(new Error('Invalid credentials'));

    const response = await login(mockRequest as HttpRequest, mockContext as InvocationContext);

    expect(response.status).toBe(401);
    expect(response.jsonBody).toEqual({
      success: false,
      error: 'Invalid credentials'
    });
  });
});
