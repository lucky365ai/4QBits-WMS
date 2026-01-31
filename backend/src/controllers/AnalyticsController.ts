import { Request, Response } from 'express';
import { prisma } from '../database/connection';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

export class AnalyticsController {
  // Dashboard Overview Stats
  async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const totalUsers = await prisma.user.count();
    const totalWorkshops = await prisma.workshop.count();
    const totalRegistrations = await prisma.registration.count();
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });

    // Recent activity
    const recentRegistrations = await prisma.registration.findMany({
      take: 5,
      orderBy: { registeredAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        workshop: { select: { title: true } },
      },
    });

    // Popular workshops
    const popularWorkshops = await prisma.workshop.findMany({
      take: 5,
      orderBy: { currentRegistrations: 'desc' },
      select: {
        id: true,
        title: true,
        currentRegistrations: true,
        maxSeats: true,
        price: true,
      },
    });

    // Monthly registration trends
    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', registered_at) as month,
        COUNT(*) as registrations,
        SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed
      FROM registrations 
      WHERE registered_at >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', registered_at)
      ORDER BY month DESC
      LIMIT 12
    `;

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalWorkshops,
          totalRegistrations,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
        recentActivity: recentRegistrations,
        popularWorkshops,
        monthlyTrends: monthlyStats,
      },
    });
  }

  // Workshop Performance Analytics
  async getWorkshopAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { workshopId } = req.params;

    const workshop = await prisma.workshop.findUnique({
      where: { id: Number(workshopId) },
      include: {
        registrations: {
          include: {
            user: { select: { name: true, email: true } },
            payment: { select: { amount: true, status: true } },
          },
        },
        sessions: {
          include: {
            attendance: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
        feedback: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!workshop) {
      throw new AppError('Workshop not found', 404);
    }

    // Calculate metrics
    const totalRegistrations = workshop.registrations.length;
    const confirmedRegistrations = workshop.registrations.filter(r => r.status === 'CONFIRMED').length;
    const totalRevenue = workshop.registrations
      .filter(r => r.payment?.status === 'COMPLETED')
      .reduce((sum, r) => sum + (r.payment?.amount || 0), 0);

    // Attendance rates per session
    const sessionStats = workshop.sessions.map(session => ({
      id: session.id,
      title: session.title,
      date: session.sessionDate,
      totalAttendees: session.attendance.length,
      attendanceRate: confirmedRegistrations > 0 
        ? Math.round((session.attendance.length / confirmedRegistrations) * 100) 
        : 0,
    }));

    // Feedback summary
    const avgRating = workshop.feedback.length > 0
      ? workshop.feedback.reduce((sum, f) => sum + f.rating, 0) / workshop.feedback.length
      : 0;

    res.json({
      success: true,
      data: {
        workshop: {
          id: workshop.id,
          title: workshop.title,
          totalRegistrations,
          confirmedRegistrations,
          totalRevenue,
          avgRating: Math.round(avgRating * 10) / 10,
        },
        sessionStats,
        feedback: workshop.feedback.slice(0, 10), // Latest 10 feedback
        registrationTrend: workshop.registrations.map(r => ({
          date: r.registeredAt,
          status: r.status,
        })),
      },
    });
  }

  // User Engagement Analytics
  async getUserEngagement(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Most active users
    const activeUsers = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        registrations: {
          where: { status: 'CONFIRMED' },
        },
        attendance: true,
        _count: {
          select: {
            registrations: true,
            attendance: true,
            feedback: true,
          },
        },
      },
      orderBy: {
        registrations: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // User registration patterns
    const registrationPatterns = await prisma.$queryRaw`
      SELECT 
        strftime('%w', registered_at) as day_of_week,
        strftime('%H', registered_at) as hour,
        COUNT(*) as count
      FROM registrations 
      WHERE registered_at >= date('now', '-3 months')
      GROUP BY strftime('%w', registered_at), strftime('%H', registered_at)
      ORDER BY count DESC
    `;

    // Completion rates
    const completionStats = await prisma.$queryRaw`
      SELECT 
        w.id,
        w.title,
        COUNT(DISTINCT r.user_id) as registered_users,
        COUNT(DISTINCT c.user_id) as completed_users,
        ROUND(
          CAST(COUNT(DISTINCT c.user_id) AS FLOAT) / 
          CAST(COUNT(DISTINCT r.user_id) AS FLOAT) * 100, 2
        ) as completion_rate
      FROM workshops w
      LEFT JOIN registrations r ON w.id = r.workshop_id AND r.status = 'CONFIRMED'
      LEFT JOIN certificates c ON w.id = c.workshop_id
      WHERE w.status = 'PUBLISHED'
      GROUP BY w.id, w.title
      HAVING registered_users > 0
      ORDER BY completion_rate DESC
    `;

    res.json({
      success: true,
      data: {
        activeUsers: activeUsers.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          totalRegistrations: user._count.registrations,
          totalAttendance: user._count.attendance,
          totalFeedback: user._count.feedback,
        })),
        registrationPatterns,
        completionStats,
      },
    });
  }

  // Revenue Analytics
  async getRevenueAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { period = '12m' } = req.query;

    // Revenue by month
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', completed_at) as month,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM payments 
      WHERE status = 'COMPLETED' 
        AND completed_at >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', completed_at)
      ORDER BY month DESC
    `;

    // Revenue by workshop category
    const categoryRevenue = await prisma.$queryRaw`
      SELECT 
        c.name as category,
        SUM(p.amount) as revenue,
        COUNT(p.id) as transactions
      FROM payments p
      JOIN workshops w ON p.workshop_id = w.id
      JOIN categories c ON w.category_id = c.id
      WHERE p.status = 'COMPLETED'
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
    `;

    // Top earning workshops
    const topWorkshops = await prisma.workshop.findMany({
      include: {
        payments: {
          where: { status: 'COMPLETED' },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    const workshopRevenue = topWorkshops
      .map(workshop => ({
        id: workshop.id,
        title: workshop.title,
        revenue: workshop.payments.reduce((sum, p) => sum + p.amount, 0),
        registrations: workshop._count.registrations,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        monthlyRevenue,
        categoryRevenue,
        topWorkshops: workshopRevenue,
        summary: {
          totalRevenue: workshopRevenue.reduce((sum, w) => sum + w.revenue, 0),
          totalTransactions: topWorkshops.reduce((sum, w) => sum + w.payments.length, 0),
        },
      },
    });
  }

  // Export Analytics Data
  async exportAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { type, format = 'json' } = req.query;

    let data: any = {};

    switch (type) {
      case 'users':
        data = await prisma.user.findMany({
          include: {
            _count: {
              select: {
                registrations: true,
                attendance: true,
                feedback: true,
              },
            },
          },
        });
        break;

      case 'workshops':
        data = await prisma.workshop.findMany({
          include: {
            category: true,
            speaker: { select: { name: true, email: true } },
            _count: {
              select: {
                registrations: true,
                sessions: true,
                feedback: true,
              },
            },
          },
        });
        break;

      case 'registrations':
        data = await prisma.registration.findMany({
          include: {
            user: { select: { name: true, email: true } },
            workshop: { select: { title: true } },
            payment: { select: { amount: true, status: true } },
          },
        });
        break;

      default:
        throw new AppError('Invalid export type', 400);
    }

    if (format === 'csv') {
      // Convert to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export.csv"`);
      // CSV conversion logic would go here
      res.send('CSV export coming soon');
    } else {
      res.json({
        success: true,
        data,
        exportedAt: new Date().toISOString(),
        type,
        count: Array.isArray(data) ? data.length : 1,
      });
    }
  }
}