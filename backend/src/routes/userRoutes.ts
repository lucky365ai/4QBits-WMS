import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { prisma } from '../database/connection';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      bio: true,
      profileImage: true,
      socialLinks: true,
      expertise: true,
      phone: true,
      isVerified: true,
      isApproved: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    data: { user },
  });
}));

// Update user profile
router.put('/profile', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, bio, phone, expertise } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      name,
      bio,
      phone,
      expertise,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      bio: true,
      profileImage: true,
      socialLinks: true,
      expertise: true,
      phone: true,
      isVerified: true,
      isApproved: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    data: { user },
  });
}));

// Get speaker stats
router.get('/speaker/stats', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const speakerId = req.user!.id;

  const myWorkshops = await prisma.workshop.count({
    where: { speakerId },
  });

  const totalStudents = await prisma.registration.count({
    where: {
      workshop: { speakerId },
      status: 'CONFIRMED',
    },
  });

  const workshopsWithFeedback = await prisma.workshop.findMany({
    where: { speakerId },
    include: {
      feedback: {
        select: { rating: true },
      },
    },
  });

  const allRatings = workshopsWithFeedback.flatMap(w => w.feedback.map(f => f.rating));
  const averageRating = allRatings.length > 0
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : 0;

  res.json({
    success: true,
    data: {
      overview: {
        myWorkshops,
        totalStudents,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    },
  });
}));

// Get student stats
router.get('/student/stats', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user!.id;

  const registeredWorkshops = await prisma.registration.count({
    where: { userId: studentId },
  });

  const completed = await prisma.registration.count({
    where: {
      userId: studentId,
      workshop: {
        endDate: { lte: new Date() },
      },
      status: 'CONFIRMED',
    },
  });

  const certificates = await prisma.certificate.count({
    where: { userId: studentId },
  });

  res.json({
    success: true,
    data: {
      overview: {
        registeredWorkshops,
        completed,
        certificates,
      },
    },
  });
}));

export { router as userRoutes };