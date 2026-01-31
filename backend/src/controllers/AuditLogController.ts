import { Response } from 'express';
import { prisma } from '../database/connection';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuditLogController {
  // Get all audit logs (Admin only)
  async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, entityType, action, userId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (entityType) where.entityType = entityType as string;
    if (action) where.action = action as string;
    if (userId) where.userId = Number(userId);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
}
