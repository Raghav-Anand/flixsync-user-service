import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { userService } from '../services/userService';
import { CreateUserRequest } from '@flixsync/flixsync-shared-library';
import { getDbConnection } from '../config/database';

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    const dbConnection = getDbConnection();
    await dbConnection.initialize();
    initialized = true;
  }
}

export async function register(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    await ensureInitialized();

    const body = await request.json() as CreateUserRequest;
    const authResponse = await userService.createUser(body);

    return {
      status: 201,
      jsonBody: {
        success: true,
        data: authResponse,
      },
    };
  } catch (error: any) {
    context.error('Registration error:', error);
    return {
      status: 400,
      jsonBody: {
        success: false,
        error: error.message,
      },
    };
  }
}

app.http('register', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'v1/auth/register',
  handler: register,
});
