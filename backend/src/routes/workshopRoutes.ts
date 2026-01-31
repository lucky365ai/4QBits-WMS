import { Router } from 'express';
import { WorkshopController } from '../controllers/WorkshopController';
import { SessionController } from '../controllers/SessionController';
import { authenticate, authorize, optionalAuth, checkResourceOwnership } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const workshopController = new WorkshopController();
const sessionController = new SessionController();

// Public routes
router.get('/', asyncHandler(workshopController.getWorkshops));
router.get('/categories', asyncHandler(workshopController.getCategories));

// Speaker workshops (Moved up to avoid collision with /:id)
router.get('/speaker/:speakerId?',
  authenticate,
  authorize('ADMIN', 'SPEAKER'),
  asyncHandler(workshopController.getWorkshopsBySpeaker)
);

router.get('/:id', asyncHandler(workshopController.getWorkshopById));

// Protected routes - Workshop management
router.post('/',
  authenticate,
  authorize('ADMIN', 'SPEAKER'),
  asyncHandler(workshopController.createWorkshop)
);

router.put('/:id',
  authenticate,
  authorize('ADMIN', 'SPEAKER'),
  asyncHandler(workshopController.updateWorkshop)
);

router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(workshopController.deleteWorkshop)
);

router.post('/:id/publish',
  authenticate,
  authorize('ADMIN', 'SPEAKER'),
  asyncHandler(workshopController.publishWorkshop)
);



// Category management (Admin only)
router.post('/categories',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(workshopController.createCategory)
);

// Session management
router.post('/:workshopId/sessions',
  authenticate,
  authorize('ADMIN', 'SPEAKER'),
  asyncHandler(sessionController.createSession)
);

router.put('/sessions/:id',
  authenticate,
  authorize('ADMIN', 'SPEAKER'),
  asyncHandler(sessionController.updateSession)
);

router.delete('/sessions/:id',
  authenticate,
  authorize('ADMIN', 'SPEAKER'),
  asyncHandler(sessionController.deleteSession)
);

// QR Code and Attendance
router.post('/sessions/:id/qr',
  authenticate,
  authorize('ADMIN', 'SPEAKER'),
  asyncHandler(sessionController.generateAttendanceQR)
);

router.post('/attendance/:qrCode',
  authenticate,
  asyncHandler(sessionController.markAttendance)
);

router.post('/sessions/:id/attendance',
  authenticate,
  authorize('ADMIN', 'SPEAKER'),
  asyncHandler(sessionController.manualMarkAttendance)
);

router.get('/sessions/:id/attendance',
  authenticate,
  authorize('ADMIN', 'SPEAKER'),
  asyncHandler(sessionController.getSessionAttendance)
);

router.get('/my/attendance',
  authenticate,
  asyncHandler(sessionController.getUserAttendance)
);

// Waitlist
router.post('/:id/waitlist', authenticate, asyncHandler(workshopController.joinWaitlist));
router.delete('/:id/waitlist', authenticate, asyncHandler(workshopController.leaveWaitlist));

// Calendar
router.get('/:id/calendar', asyncHandler(workshopController.addToCalendar));

export { router as workshopRoutes };