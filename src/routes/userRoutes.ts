import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateRequest, updateUserSchema } from '../middleware/validation';

const router = Router();

router.get('/profile', authenticate, userController.getProfile);

router.put('/profile', authenticate, validateRequest(updateUserSchema), userController.updateProfile);

router.delete('/profile', authenticate, userController.deleteProfile);

router.get('/:userId', authenticate, userController.getUserById);

export { router as userRoutes };