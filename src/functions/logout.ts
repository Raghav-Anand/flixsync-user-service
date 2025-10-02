import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export async function logout(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Logout requested');

  return {
    status: 200,
    jsonBody: {
      success: true,
      message: 'Logged out successfully',
    },
  };
}

app.http('logout', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'v1/auth/logout',
  handler: logout,
});
