import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middleware/validation';
import { authSchemas } from '../validation/authSchemas';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const authController = new AuthController();

// Public authentication routes
router.post('/login', validate(authSchemas.login), asyncHandler(authController.login));
router.post('/student/register', validate(authSchemas.studentRegister), asyncHandler(authController.registerStudent));
router.post('/speaker/register', validate(authSchemas.speakerRegister), asyncHandler(authController.registerSpeaker));
router.post('/guest-speaker/apply', validate(authSchemas.guestSpeakerApply), asyncHandler(authController.applyGuestSpeaker));

// Hidden admin login
router.post('/admin/login', validate(authSchemas.adminLogin), asyncHandler(authController.adminLogin));


// Password reset
router.post('/forgot-password', validate(authSchemas.forgotPassword), asyncHandler(authController.forgotPassword));
router.post('/reset-password', validate(authSchemas.resetPassword), asyncHandler(authController.resetPassword));

// Protected routes (require authentication)
router.use(authenticate);

// Profile management
router.get('/profile', asyncHandler(authController.getProfile));
router.put('/profile', validate(authSchemas.updateProfile), asyncHandler(authController.updateProfile));
router.post('/change-password', validate(authSchemas.changePassword), asyncHandler(authController.changePassword));
router.post('/logout', asyncHandler(authController.logout));

// Refresh token
router.post('/refresh', asyncHandler(authController.refreshToken));

export { router as authRoutes };