// Type augmentation for Fastify to add user property to request

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}