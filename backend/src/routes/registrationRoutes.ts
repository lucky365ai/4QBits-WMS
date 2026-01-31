import { Router } from 'express';
import { RegistrationController } from '../controllers/RegistrationController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const registrationController = new RegistrationController();

// Student registration routes
router.post('/workshops/:workshopId/register', 
  authenticate, 
  authorize('STUDENT'), 
  asyncHandler(registrationController.registerForWorkshop)
);

router.delete('/workshops/:workshopId/register', 
  authenticate, 
  authorize('STUDENT'), 
  asyncHandler(registrationController.cancelRegistration)
);

router.get('/my-registrations', 
  authenticate, 
  authorize('STUDENT'), 
  asyncHandler(registrationController.getUserRegistrations)
);

// Admin/Speaker routes
router.get('/workshops/:workshopId/registrations', 
  authenticate, 
  authorize('ADMIN', 'SPEAKER'), 
  asyncHandler(registrationController.getWorkshopRegistrations)
);

router.post('/:registrationId/confirm', 
  authenticate, 
  authorize('ADMIN'), 
  asyncHandler(registrationController.confirmRegistration)
);

router.get('/stats', 
  authenticate, 
  authorize('ADMIN'), 
  asyncHandler(registrationController.getRegistrationStats)
);

export { router as registrationRoutes };