import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateRequest, createUserSchema, loginSchema, refreshTokenSchema } from '../middleware/validation';

const router = Router();

router.post('/register', validateRequest(createUserSchema), authController.register);

router.post('/login', validateRequest(loginSchema), authController.login);

router.post('/refresh', validateRequest(refreshTokenSchema), authController.refreshToken);

router.post('/logout', authController.logout);

export { router as authRoutes };