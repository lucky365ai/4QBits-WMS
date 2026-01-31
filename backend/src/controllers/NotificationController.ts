import { Request, Response } from 'express';
import { prisma } from '../database/connection';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import { logAudit } from '../utils/logger';

export class NotificationController {
  // Get user notifications
  async getUserNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      userId: req.user!.id,
    };

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
        unreadCount,
      },
    });
  }

  // Mark notification as read
  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    await prisma.notification.update({
      where: { id: Number(id) },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  }

  // Mark all notifications as read
  async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  }

  // Delete notification
  async deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    await prisma.notification.delete({
      where: { id: Number(id) },
    });

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  }

  // Send notification (Admin only)
  async sendNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userIds, title, message, type = 'INFO', actionUrl } = req.body;

    const notifications = userIds.map((userId: number) => ({
      userId,
      title,
      message,
      type,
      actionUrl,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    logAudit('notifications_sent', req.user!.id, 'notification', undefined, {
      recipientCount: userIds.length,
      title,
    });

    res.json({
      success: true,
      message: `Notification sent to ${userIds.length} users`,
    });
  }

  // Send bulk notifications (Admin only)
  async sendBulkNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { title, message, type = 'INFO', actionUrl, targetRole } = req.body;

    let users;
    if (targetRole === 'ALL') {
      users = await prisma.user.findMany({
        select: { id: true },
      });
    } else {
      users = await prisma.user.findMany({
        where: { role: targetRole },
        select: { id: true },
      });
    }

    const notifications = users.map(user => ({
      userId: user.id,
      title,
      message,
      type,
      actionUrl,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    logAudit('bulk_notification_sent', req.user!.id, 'notification', undefined, {
      recipientCount: users.length,
      targetRole,
      title,
    });

    res.json({
      success: true,
      message: `Notification sent to ${users.length} users`,
    });
  }

  // Get notification templates (Admin only)
  async getTemplates(req: AuthenticatedRequest, res: Response): Promise<void> {
    const templates = [
      {
        id: 'workshop_reminder',
        title: 'Workshop Reminder',
        message: 'Your workshop "{workshopTitle}" starts in 24 hours. Don\'t forget to attend!',
        type: 'REMINDER',
      },
      {
        id: 'payment_success',
        title: 'Payment Successful',
        message: 'Your payment for "{workshopTitle}" has been processed successfully.',
        type: 'SUCCESS',
      },
      {
        id: 'certificate_ready',
        title: 'Certificate Ready',
        message: 'Your certificate for "{workshopTitle}" is now available for download.',
        type: 'SUCCESS',
      },
      {
        id: 'workshop_cancelled',
        title: 'Workshop Cancelled',
        message: 'Unfortunately, "{workshopTitle}" has been cancelled. You will receive a full refund.',
        type: 'WARNING',
      },
      {
        id: 'new_workshop',
        title: 'New Workshop Available',
        message: 'A new workshop "{workshopTitle}" is now available for registration.',
        type: 'INFO',
      },
    ];

    res.json({
      success: true,
      data: { templates },
    });
  }

  // Create automated notifications
  static async createWorkshopReminder(workshopId: number): Promise<void> {
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: {
        registrations: {
          where: { status: 'CONFIRMED' },
          include: { user: true },
        },
      },
    });

    if (!workshop) return;

    const notifications = workshop.registrations.map(registration => ({
      userId: registration.userId,
      title: 'Workshop Reminder',
      message: `Your workshop "${workshop.title}" starts in 24 hours. Don't forget to attend!`,
      type: 'REMINDER',
      actionUrl: `/dashboard/registrations`,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });
  }

  static async createPaymentNotification(userId: number, workshopTitle: string, success: boolean): Promise<void> {
    await prisma.notification.create({
      data: {
        userId,
        title: success ? 'Payment Successful' : 'Payment Failed',
        message: success 
          ? `Your payment for "${workshopTitle}" has been processed successfully.`
          : `Your payment for "${workshopTitle}" could not be processed. Please try again.`,
        type: success ? 'SUCCESS' : 'ERROR',
        actionUrl: '/dashboard/registrations',
      },
    });
  }

  static async createCertificateNotification(userId: number, workshopTitle: string): Promise<void> {
    await prisma.notification.create({
      data: {
        userId,
        title: 'Certificate Ready',
        message: `Your certificate for "${workshopTitle}" is now available for download.`,
        type: 'SUCCESS',
        actionUrl: '/dashboard/certificates',
      },
    });
  }
}