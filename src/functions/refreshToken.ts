import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { userService } from '../services/userService';
import { getDbConnection } from '../config/database';

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    const dbConnection = getDbConnection();
    await dbConnection.initialize();
    initialized = true;
  }
}

export async function refreshToken(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    await ensureInitialized();

    const body = await request.json() as { refreshToken: string };
    const authResponse = await userService.refreshToken(body.refreshToken);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: authResponse,
      },
    };
  } catch (error: any) {
    context.error('Refresh token error:', error);
    return {
      status: 401,
      jsonBody: {
        success: false,
        error: error.message,
      },
    };
  }
}

app.http('refreshToken', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'v1/auth/refresh',
  handler: refreshToken,
});
