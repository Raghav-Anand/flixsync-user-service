import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createApp } from './app';
import { getDbConnection } from './config/database';

let fastifyApp: any = null;

// Initialize Fastify app once
const initializeFastifyApp = async () => {
  if (!fastifyApp) {
    const dbConnection = getDbConnection();
    await dbConnection.initialize();
    console.log('Database connection established');

    fastifyApp = await createApp();
    await fastifyApp.ready();
    console.log('Fastify app initialized');
  }
  return fastifyApp;
};

// Azure Function HTTP handler
export async function httpTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const app = await initializeFastifyApp();

    // Convert Azure Functions request to Fastify-compatible request
    const url = new URL(request.url);
    const path = url.pathname + url.search;
    const method = request.method;
    const headers = Object.fromEntries(request.headers.entries());

    let body: any;
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : undefined;
    } catch {
      body = undefined;
    }

    // Inject request into Fastify
    const response = await app.inject({
      method: method as any,
      url: path,
      headers: headers,
      payload: body,
    });

    // Convert Fastify response to Azure Functions response
    return {
      status: response.statusCode,
      headers: response.headers as Record<string, string>,
      body: response.body,
    };
  } catch (error) {
    context.error('Error processing request:', error);
    return {
      status: 500,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
    };
  }
}

// Register the HTTP trigger
app.http('httpTrigger', {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  authLevel: 'anonymous',
  route: '{*segments}',
  handler: httpTrigger,
});
