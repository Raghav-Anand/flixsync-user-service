import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export async function health(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Health check requested');

  return {
    status: 200,
    jsonBody: {
      success: true,
      message: 'User service is healthy',
      timestamp: new Date().toISOString(),
    },
  };
}

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'v1/health',
  handler: health,
});
