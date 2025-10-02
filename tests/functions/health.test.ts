import { describe, it, expect, vi } from 'vitest';
import { health } from '../../src/functions/health';
import { HttpRequest, InvocationContext } from '@azure/functions';

describe('Health Function', () => {
  it('should return healthy status', async () => {
    const mockRequest = {} as HttpRequest;
    const mockContext = {
      log: vi.fn(),
      error: vi.fn(),
    } as Partial<InvocationContext>;

    const response = await health(mockRequest, mockContext as InvocationContext);

    expect(response.status).toBe(200);
    expect(response.jsonBody).toMatchObject({
      success: true,
      message: 'User service is healthy',
    });
    expect(response.jsonBody).toHaveProperty('timestamp');
  });
});
