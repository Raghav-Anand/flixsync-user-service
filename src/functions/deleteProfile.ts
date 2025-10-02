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

export async function deleteProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    await ensureInitialized();
    const user = await authenticateRequest(request);

    await userService.deleteUser(user.id);

    return {
      status: 200,
      jsonBody: {
        success: true,
        message: 'User account deleted successfully',
      },
    };
  } catch (error: any) {
    context.error('Delete profile error:', error);
    return {
      status: error.message === 'Access token required' ? 401 : 400,
      jsonBody: {
        success: false,
        error: error.message,
      },
    };
  }
}

app.http('deleteProfile', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'v1/users/profile',
  handler: deleteProfile,
});
