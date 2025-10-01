import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const setupErrorHandlers = (app: FastifyInstance): void => {
  // Global error handler
  app.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    request.log.error({
      message: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    }, 'Request error occurred');

    return reply.status(statusCode).send({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  });

  // 404 handler
  app.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(404).send({
      success: false,
      error: `Route ${request.method} ${request.url} not found`,
    });
  });
};