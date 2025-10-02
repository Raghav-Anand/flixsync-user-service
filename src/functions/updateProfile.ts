import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { userService } from '../services/userService';
import { authenticateRequest } from '../utils/azureAuth';
import { UpdateUserRequest } from '@flixsync/flixsync-shared-library';
import { getDbConnection } from '../config/database';

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    const dbConnection = getDbConnection();
    await dbConnection.initialize();
    initialized = true;
  }
}

export async function updateProfile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    await ensureInitialized();
    const user = await authenticateRequest(request);

    const updateData = await request.json() as UpdateUserRequest;
    const updatedUser = await userService.updateUser(user.id, updateData);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: updatedUser,
      },
    };
  } catch (error: any) {
    context.error('Update profile error:', error);
    return {
      status: error.message === 'Access token required' ? 401 : 400,
      jsonBody: {
        success: false,
        error: error.message,
      },
    };
  }
}

app.http('updateProfile', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'v1/users/profile',
  handler: updateProfile,
});
