import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { userService } from '../services/userService';
import { LoginRequest } from '@flixsync/flixsync-shared-library';
import { getDbConnection } from '../config/database';

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    const dbConnection = getDbConnection();
    await dbConnection.initialize();
    initialized = true;
  }
}

export async function login(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    await ensureInitialized();

    const body = await request.json() as LoginRequest;
    const authResponse = await userService.loginUser(body);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: authResponse,
      },
    };
  } catch (error: any) {
    context.error('Login error:', error);
    return {
      status: 401,
      jsonBody: {
        success: false,
        error: error.message,
      },
    };
  }
}

app.http('login', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'v1/auth/login',
  handler: login,
});
