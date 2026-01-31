import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { AuditLogController } from '../controllers/AuditLogController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const analyticsController = new AnalyticsController();
const auditLogController = new AuditLogController();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

// Admin dashboard stats
router.get('/analytics/dashboard', asyncHandler(analyticsController.getDashboardStats.bind(analyticsController)));
router.get('/analytics/revenue', asyncHandler(analyticsController.getRevenueAnalytics.bind(analyticsController)));
router.get('/analytics/engagement', asyncHandler(analyticsController.getUserEngagement.bind(analyticsController)));
router.get('/analytics/export', asyncHandler(analyticsController.exportAnalytics.bind(analyticsController)));

// Audit Logs
router.get('/audit-logs', asyncHandler(auditLogController.getAuditLogs.bind(auditLogController)));

export { router as adminRoutes };