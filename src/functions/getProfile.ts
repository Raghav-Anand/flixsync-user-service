import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { userService } from '../services/userService';
import { authenticateRequest } from '../utils/azureAuth';
import { getDbConnection } from '../config/database';

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    const dbConnection = getDbConnection();
    await dbConnection.initialize();
    initialized = true;
  }
}

export async function getProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    await ensureInitialized();
    const user = await authenticateRequest(request);

    const profile = await userService.getUserById(user.id);
    if (!profile) {
      return {
        status: 404,
        jsonBody: {
          success: false,
          error: 'User not found',
        },
      };
    }

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: profile,
      },
    };
  } catch (error: any) {
    context.error('Get profile error:', error);
    return {
      status: error.message === 'Access token required' ? 401 : 500,
      jsonBody: {
        success: false,
        error: error.message,
      },
    };
  }
}

app.http('getProfile', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'v1/users/profile',
  handler: getProfile,
});
