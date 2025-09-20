import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User service is healthy',
    timestamp: new Date().toISOString(),
  });
});

export { router as routes };