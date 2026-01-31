import { Request, Response } from 'express';
import { prisma } from '../database/connection';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError, ValidationError, NotFoundError, ConflictError } from '../utils/AppError';
import { logAudit } from '../utils/logger';

export class RegistrationController {
  // Register for workshop (Student)
  async registerForWorkshop(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { workshopId } = req.params;

    const workshop = await prisma.workshop.findUnique({
      where: { id: Number(workshopId) },
      include: {
        registrations: true,
      },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    if (workshop.status !== 'PUBLISHED') {
      throw new ValidationError('Workshop is not available for registration');
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_workshopId: {
          userId: req.user!.id,
          workshopId: Number(workshopId),
        },
      },
    });

    if (existingRegistration) {
      throw new ConflictError('Already registered for this workshop');
    }

    // Check seat availability
    if (workshop.maxSeats && workshop.currentRegistrations >= workshop.maxSeats) {
      throw new ConflictError('Workshop is full');
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        userId: req.user!.id,
        workshopId: Number(workshopId),
        status: workshop.price > 0 ? 'PENDING' : 'CONFIRMED',
      },
      include: {
        workshop: {
          select: {
            id: true,
            title: true,
            price: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    // Update workshop registration count
    await prisma.workshop.update({
      where: { id: Number(workshopId) },
      data: {
        currentRegistrations: {
          increment: 1,
        },
      },
    });

    logAudit('workshop_registered', req.user!.id, 'registration', registration.id);

    res.status(201).json({
      success: true,
      message: workshop.price > 0 
        ? 'Registration created. Please complete payment to confirm.' 
        : 'Registration confirmed successfully',
      data: { 
        registration,
        requiresPayment: workshop.price > 0,
      },
    });
  }

  // Cancel registration (Student)
  async cancelRegistration(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { workshopId } = req.params;

    const registration = await prisma.registration.findUnique({
      where: {
        userId_workshopId: {
          userId: req.user!.id,
          workshopId: Number(workshopId),
        },
      },
      include: {
        workshop: true,
      },
    });

    if (!registration) {
      throw new NotFoundError('Registration not found');
    }

    // Check if workshop has started
    if (registration.workshop.startDate <= new Date()) {
      throw new ValidationError('Cannot cancel registration after workshop has started');
    }

    // Update registration status
    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED' },
    });

    // Update workshop registration count
    await prisma.workshop.update({
      where: { id: Number(workshopId) },
      data: {
        currentRegistrations: {
          decrement: 1,
        },
      },
    });

    logAudit('registration_cancelled', req.user!.id, 'registration', registration.id);

    res.json({
      success: true,
      message: 'Registration cancelled successfully',
    });
  }

  // Get user's registrations (Student)
  async getUserRegistrations(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { status } = req.query;

    const where: any = {
      userId: req.user!.id,
    };

    if (status) {
      where.status = status as string;
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        workshop: {
          include: {
            category: true,
            speaker: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
            sessions: {
              orderBy: { sessionDate: 'asc' },
            },
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            completedAt: true,
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    // Get attendance for each workshop
    const registrationsWithAttendance = await Promise.all(
      registrations.map(async (registration) => {
        const attendance = await prisma.attendance.findMany({
          where: {
            userId: req.user!.id,
            session: {
              workshopId: registration.workshopId,
            },
          },
          include: {
            session: {
              select: {
                id: true,
                title: true,
                sessionDate: true,
              },
            },
          },
        });

        const totalSessions = registration.workshop.sessions.length;
        const attendedSessions = attendance.length;
        const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

        return {
          ...registration,
          attendance: {
            attended: attendedSessions,
            total: totalSessions,
            rate: Math.round(attendanceRate),
            sessions: attendance,
          },
        };
      })
    );

    res.json({
      success: true,
      data: { registrations: registrationsWithAttendance },
    });
  }

  // Get workshop registrations (Admin/Speaker owner)
  async getWorkshopRegistrations(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { workshopId } = req.params;

    const workshop = await prisma.workshop.findUnique({
      where: { id: Number(workshopId) },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    // Check access
    if (req.user!.role === 'SPEAKER' && workshop.speakerId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    const registrations = await prisma.registration.findMany({
      where: { workshopId: Number(workshopId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            completedAt: true,
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    // Get attendance statistics
    const attendanceStats = await Promise.all(
      registrations.map(async (registration) => {
        const attendance = await prisma.attendance.count({
          where: {
            userId: registration.userId,
            session: {
              workshopId: Number(workshopId),
            },
          },
        });

        const totalSessions = await prisma.session.count({
          where: { workshopId: Number(workshopId) },
        });

        return {
          userId: registration.userId,
          attended: attendance,
          total: totalSessions,
          rate: totalSessions > 0 ? Math.round((attendance / totalSessions) * 100) : 0,
        };
      })
    );

    const registrationsWithStats = registrations.map((registration) => {
      const stats = attendanceStats.find(s => s.userId === registration.userId);
      return {
        ...registration,
        attendance: stats,
      };
    });

    res.json({
      success: true,
      data: {
        workshop: {
          id: workshop.id,
          title: workshop.title,
          maxSeats: workshop.maxSeats,
          currentRegistrations: workshop.currentRegistrations,
        },
        registrations: registrationsWithStats,
        stats: {
          total: registrations.length,
          confirmed: registrations.filter(r => r.status === 'CONFIRMED').length,
          pending: registrations.filter(r => r.status === 'PENDING').length,
          cancelled: registrations.filter(r => r.status === 'CANCELLED').length,
        },
      },
    });
  }

  // Confirm registration (Admin - for manual confirmation)
  async confirmRegistration(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { registrationId } = req.params;

    const registration = await prisma.registration.findUnique({
      where: { id: Number(registrationId) },
      include: {
        workshop: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!registration) {
      throw new NotFoundError('Registration not found');
    }

    if (registration.status === 'CONFIRMED') {
      throw new ValidationError('Registration is already confirmed');
    }

    await prisma.registration.update({
      where: { id: Number(registrationId) },
      data: { status: 'CONFIRMED' },
    });

    logAudit('registration_confirmed', req.user!.id, 'registration', Number(registrationId));

    res.json({
      success: true,
      message: 'Registration confirmed successfully',
    });
  }

  // Get registration statistics (Admin)
  async getRegistrationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const totalRegistrations = await prisma.registration.count();
    const confirmedRegistrations = await prisma.registration.count({
      where: { status: 'CONFIRMED' },
    });
    const pendingRegistrations = await prisma.registration.count({
      where: { status: 'PENDING' },
    });
    const cancelledRegistrations = await prisma.registration.count({
      where: { status: 'CANCELLED' },
    });

    // Recent registrations
    const recentRegistrations = await prisma.registration.findMany({
      take: 10,
      orderBy: { registeredAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        workshop: {
          select: {
            title: true,
          },
        },
      },
    });

    // Popular workshops
    const popularWorkshops = await prisma.workshop.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { currentRegistrations: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        currentRegistrations: true,
        maxSeats: true,
      },
    });

    res.json({
      success: true,
      data: {
        stats: {
          total: totalRegistrations,
          confirmed: confirmedRegistrations,
          pending: pendingRegistrations,
          cancelled: cancelledRegistrations,
        },
        recentRegistrations,
        popularWorkshops,
      },
    });
  }
}