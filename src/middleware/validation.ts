// JSON Schema definitions for Fastify validation

export const createUserSchema = {
  type: 'object',
  required: ['email', 'username', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    username: { type: 'string', minLength: 3, maxLength: 30, pattern: '^[a-zA-Z0-9]+$' },
    password: { type: 'string', minLength: 8 },
    profile: {
      type: 'object',
      properties: {
        firstName: { type: 'string', maxLength: 50 },
        lastName: { type: 'string', maxLength: 50 },
        avatar: { type: 'string', format: 'uri' },
        dateOfBirth: { type: 'string', format: 'date' },
        favoriteGenres: { type: 'array', items: { type: 'string' } },
        bio: { type: 'string', maxLength: 500 },
      },
    },
    preferences: {
      type: 'object',
      properties: {
        language: { type: 'string', minLength: 2, maxLength: 2 },
        region: { type: 'string', minLength: 2, maxLength: 2 },
        adultContent: { type: 'boolean' },
        notifications: {
          type: 'object',
          properties: {
            newRecommendations: { type: 'boolean' },
            groupInvites: { type: 'boolean' },
            movieUpdates: { type: 'boolean' },
            email: { type: 'boolean' },
            push: { type: 'boolean' },
          },
        },
        privacy: {
          type: 'object',
          properties: {
            profileVisibility: { type: 'string', enum: ['public', 'friends', 'private'] },
            ratingsVisibility: { type: 'string', enum: ['public', 'friends', 'private'] },
            allowGroupInvites: { type: 'boolean' },
          },
        },
      },
    },
  },
} as const;

export const loginSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
  },
} as const;

export const updateUserSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'object',
      properties: {
        firstName: { type: 'string', maxLength: 50 },
        lastName: { type: 'string', maxLength: 50 },
        avatar: { type: 'string', format: 'uri' },
        dateOfBirth: { type: 'string', format: 'date' },
        favoriteGenres: { type: 'array', items: { type: 'string' } },
        bio: { type: 'string', maxLength: 500 },
      },
    },
    preferences: {
      type: 'object',
      properties: {
        language: { type: 'string', minLength: 2, maxLength: 2 },
        region: { type: 'string', minLength: 2, maxLength: 2 },
        adultContent: { type: 'boolean' },
        notifications: {
          type: 'object',
          properties: {
            newRecommendations: { type: 'boolean' },
            groupInvites: { type: 'boolean' },
            movieUpdates: { type: 'boolean' },
            email: { type: 'boolean' },
            push: { type: 'boolean' },
          },
        },
        privacy: {
          type: 'object',
          properties: {
            profileVisibility: { type: 'string', enum: ['public', 'friends', 'private'] },
            ratingsVisibility: { type: 'string', enum: ['public', 'friends', 'private'] },
            allowGroupInvites: { type: 'boolean' },
          },
        },
      },
    },
    streamingSubscriptions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['serviceId', 'serviceName', 'isActive', 'addedAt'],
        properties: {
          serviceId: { type: 'string' },
          serviceName: { type: 'string' },
          isActive: { type: 'boolean' },
          tier: { type: 'string' },
          addedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
} as const;

export const refreshTokenSchema = {
  type: 'object',
  required: ['refreshToken'],
  properties: {
    refreshToken: { type: 'string' },
  },
} as const;