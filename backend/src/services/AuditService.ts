import { prisma } from '../database/connection';
import { logger } from '../utils/logger';

export class AuditService {
  async log(
    action: string,
    userId: number | null,
    entityType: string,
    entityId?: number,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action,
          userId,
          entityType,
          entityId,
          newValues: details,
          ipAddress,
          userAgent,
        },
      });

      logger.info('Audit log created', {
        action,
        userId,
        entityType,
        entityId,
      });
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      // Don't throw error as audit logging shouldn't break the main flow
    }
  }

  async logWithOldValues(
    action: string,
    userId: number | null,
    entityType: string,
    entityId: number,
    oldValues: any,
    newValues: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action,
          userId,
          entityType,
          entityId,
          oldValues,
          newValues,
          ipAddress,
          userAgent,
        },
      });

      logger.info('Audit log with old values created', {
        action,
        userId,
        entityType,
        entityId,
      });
    } catch (error) {
      logger.error('Failed to create audit log with old values:', error);
    }
  }

  async getAuditLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      userId?: number;
      entityType?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }
    
    if (filters?.action) {
      where.action = { contains: filters.action, mode: 'insensitive' };
    }
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserActivity(userId: number, limit: number = 20) {
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs;
  }

  async getEntityHistory(entityType: string, entityId: number) {
    const logs = await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
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
      orderBy: { createdAt: 'desc' },
    });

    return logs;
  }

  async getSystemStats() {
    const [
      totalLogs,
      todayLogs,
      topActions,
      topUsers,
    ] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      prisma.auditLog.groupBy({
        by: ['userId'],
        _count: { userId: true },
        where: { userId: { not: null } },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      todayLogs,
      topActions: topActions.map(item => ({
        action: item.action,
        count: item._count.action,
      })),
      topUsers: topUsers.map(item => ({
        userId: item.userId,
        count: item._count.userId,
      })),
    };
  }
}