import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      res.status(400).json({
        error: 'Validation failed',
        details: errorMessages,
      });
      return;
    }

    next();
  };
};

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  profile: Joi.object({
    firstName: Joi.string().max(50),
    lastName: Joi.string().max(50),
    avatar: Joi.string().uri(),
    dateOfBirth: Joi.date(),
    favoriteGenres: Joi.array().items(Joi.string()),
    bio: Joi.string().max(500),
  }),
  preferences: Joi.object({
    language: Joi.string().length(2),
    region: Joi.string().length(2),
    adultContent: Joi.boolean(),
    notifications: Joi.object({
      newRecommendations: Joi.boolean(),
      groupInvites: Joi.boolean(),
      movieUpdates: Joi.boolean(),
      email: Joi.boolean(),
      push: Joi.boolean(),
    }),
    privacy: Joi.object({
      profileVisibility: Joi.string().valid('public', 'friends', 'private'),
      ratingsVisibility: Joi.string().valid('public', 'friends', 'private'),
      allowGroupInvites: Joi.boolean(),
    }),
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  profile: Joi.object({
    firstName: Joi.string().max(50),
    lastName: Joi.string().max(50),
    avatar: Joi.string().uri(),
    dateOfBirth: Joi.date(),
    favoriteGenres: Joi.array().items(Joi.string()),
    bio: Joi.string().max(500),
  }),
  preferences: Joi.object({
    language: Joi.string().length(2),
    region: Joi.string().length(2),
    adultContent: Joi.boolean(),
    notifications: Joi.object({
      newRecommendations: Joi.boolean(),
      groupInvites: Joi.boolean(),
      movieUpdates: Joi.boolean(),
      email: Joi.boolean(),
      push: Joi.boolean(),
    }),
    privacy: Joi.object({
      profileVisibility: Joi.string().valid('public', 'friends', 'private'),
      ratingsVisibility: Joi.string().valid('public', 'friends', 'private'),
      allowGroupInvites: Joi.boolean(),
    }),
  }),
  streamingSubscriptions: Joi.array().items(
    Joi.object({
      serviceId: Joi.string().required(),
      serviceName: Joi.string().required(),
      isActive: Joi.boolean().required(),
      tier: Joi.string(),
      addedAt: Joi.date().required(),
    })
  ),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});