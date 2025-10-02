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

export async function getUserById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    await ensureInitialized();
    await authenticateRequest(request);

    const userId = request.params.userId;
    if (!userId) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'User ID is required',
        },
      };
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return {
        status: 404,
        jsonBody: {
          success: false,
          error: 'User not found',
        },
      };
    }

    const { passwordHash, email, ...publicUser } = user;

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: publicUser,
      },
    };
  } catch (error: any) {
    context.error('Get user by ID error:', error);
    return {
      status: error.message === 'Access token required' ? 401 : 500,
      jsonBody: {
        success: false,
        error: error.message,
      },
    };
  }
}

app.http('getUserById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'v1/users/{userId}',
  handler: getUserById,
});
