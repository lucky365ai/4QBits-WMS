import { Request, Response } from 'express';
import { prisma } from '../database/connection';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError, ValidationError, NotFoundError } from '../utils/AppError';
import { logAudit } from '../utils/logger';
import QRCode from 'qrcode';
import crypto from 'crypto';

export class SessionController {
  // Create session (Admin/Speaker owner)
  async createSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { workshopId } = req.params;
    const { title, description, sessionDate, startTime, endTime } = req.body;

    const workshop = await prisma.workshop.findUnique({
      where: { id: Number(workshopId) },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    // Check ownership
    if (req.user!.role === 'SPEAKER' && workshop.speakerId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    const session = await prisma.session.create({
      data: {
        workshopId: Number(workshopId),
        title,
        description,
        sessionDate: new Date(sessionDate),
        startTime,
        endTime,
      },
    });

    logAudit('session_created', req.user!.id, 'session', session.id);

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: { session },
    });
  }

  // Update session (Admin/Speaker owner)
  async updateSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { title, description, sessionDate, startTime, endTime } = req.body;

    const session = await prisma.session.findUnique({
      where: { id: Number(id) },
      include: { workshop: true },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Check ownership
    if (req.user!.role === 'SPEAKER' && session.workshop.speakerId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    const updatedSession = await prisma.session.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(sessionDate && { sessionDate: new Date(sessionDate) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
      },
    });

    logAudit('session_updated', req.user!.id, 'session', Number(id));

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: { session: updatedSession },
    });
  }

  // Delete session (Admin/Speaker owner)
  async deleteSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id: Number(id) },
      include: {
        workshop: true,
        attendance: true,
      },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Check ownership
    if (req.user!.role === 'SPEAKER' && session.workshop.speakerId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    if (session.attendance.length > 0) {
      throw new ValidationError('Cannot delete session with existing attendance records');
    }

    await prisma.session.delete({
      where: { id: Number(id) },
    });

    logAudit('session_deleted', req.user!.id, 'session', Number(id));

    res.json({
      success: true,
      message: 'Session deleted successfully',
    });
  }

  // Generate QR code for attendance (Admin/Speaker owner)
  async generateAttendanceQR(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id: Number(id) },
      include: { workshop: true },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Check ownership
    if (req.user!.role === 'SPEAKER' && session.workshop.speakerId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    // Generate unique QR code
    const qrCode = crypto.randomBytes(16).toString('hex');
    const qrExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    // Update session with QR code
    await prisma.session.update({
      where: { id: Number(id) },
      data: {
        qrCode,
        qrExpiresAt,
      },
    });

    // Generate QR code image
    const qrCodeUrl = `${process.env.FRONTEND_URL}/attendance/${qrCode}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl);

    logAudit('qr_generated', req.user!.id, 'session', Number(id));

    res.json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCode,
        qrCodeImage,
        expiresAt: qrExpiresAt,
        attendanceUrl: qrCodeUrl,
      },
    });
  }

  // Mark attendance via QR code
  async markAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { qrCode } = req.params;

    const session = await prisma.session.findUnique({
      where: { qrCode },
      include: {
        workshop: {
          include: {
            registrations: {
              where: { userId: req.user!.id },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Invalid QR code');
    }

    // Check if QR code is expired
    if (!session.qrExpiresAt || session.qrExpiresAt < new Date()) {
      throw new ValidationError('QR code has expired');
    }

    // Check if user is registered for the workshop
    if (session.workshop.registrations.length === 0) {
      throw new ValidationError('You are not registered for this workshop');
    }

    // Check if attendance already marked
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_sessionId: {
          userId: req.user!.id,
          sessionId: session.id,
        },
      },
    });

    if (existingAttendance) {
      throw new ValidationError('Attendance already marked for this session');
    }

    // Mark attendance
    const attendance = await prisma.attendance.create({
      data: {
        userId: req.user!.id,
        sessionId: session.id,
        qrVerified: true,
        ipAddress: req.ip,
      },
    });

    logAudit('attendance_marked', req.user!.id, 'attendance', attendance.id);

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        attendance: {
          sessionTitle: session.title,
          workshopTitle: session.workshop.title,
          markedAt: attendance.markedAt,
        },
      },
    });
  }

  // Manual attendance marking (Admin/Speaker owner)
  async manualMarkAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params; // Session ID
    const { userId } = req.body;

    const session = await prisma.session.findUnique({
      where: { id: Number(id) },
      include: { workshop: true },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Check ownership
    if (req.user!.role === 'SPEAKER' && session.workshop.speakerId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    // Check if user is registered for the workshop
    const registration = await prisma.registration.findFirst({
      where: {
        workshopId: session.workshopId,
        userId: Number(userId),
        status: 'CONFIRMED',
      },
    });

    if (!registration) {
      throw new ValidationError('User is not registered for this workshop');
    }

    // Check if attendance already marked
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_sessionId: {
          userId: Number(userId),
          sessionId: session.id,
        },
      },
    });

    if (existingAttendance) {
      throw new ValidationError('Attendance already marked for this user');
    }

    // Mark attendance
    const attendance = await prisma.attendance.create({
      data: {
        userId: Number(userId),
        sessionId: session.id,
        qrVerified: false, // Manual marking
        ipAddress: req.ip,
      },
    });

    logAudit('attendance_marked_manual', req.user!.id, 'attendance', attendance.id);

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: { attendance },
    });
  }

  // Get session attendance (Admin/Speaker owner)
  async getSessionAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id: Number(id) },
      include: { workshop: true },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Check ownership
    if (req.user!.role === 'SPEAKER' && session.workshop.speakerId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    const attendance = await prisma.attendance.findMany({
      where: { sessionId: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { markedAt: 'desc' },
    });

    const registrations = await prisma.registration.findMany({
      where: {
        workshopId: session.workshopId,
        status: 'CONFIRMED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        session: {
          id: session.id,
          title: session.title,
          sessionDate: session.sessionDate,
        },
        attendance,
        registrations,
        stats: {
          totalRegistered: registrations.length,
          totalAttended: attendance.length,
          attendanceRate: registrations.length > 0
            ? Math.round((attendance.length / registrations.length) * 100)
            : 0,
        },
      },
    });
  }

  // Get user's attendance history
  async getUserAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    const attendance = await prisma.attendance.findMany({
      where: { userId: req.user!.id },
      include: {
        session: {
          include: {
            workshop: {
              select: {
                id: true,
                title: true,
                speaker: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { markedAt: 'desc' },
    });

    res.json({
      success: true,
      data: { attendance },
    });
  }
}