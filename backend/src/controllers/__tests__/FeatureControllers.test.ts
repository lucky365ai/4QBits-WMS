import { Request, Response } from 'express';
import { AnalyticsController } from '../AnalyticsController';
import { AuditLogController } from '../AuditLogController';
import { CertificateController } from '../CertificateController';
import { SessionController } from '../SessionController';
import { prisma } from '../../database/connection';
import PDFDocument from 'pdfkit';

// Mock dependencies
jest.mock('../../database/connection', () => ({
  prisma: {
    user: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    workshop: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    registration: { count: jest.fn(), findMany: jest.fn() },
    payment: { aggregate: jest.fn() },
    session: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
    attendance: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    certificate: { findMany: jest.fn(), findUnique: jest.fn() },
    auditLog: { findMany: jest.fn(), count: jest.fn() },
    $queryRaw: jest.fn(),
  },
}));

jest.mock('pdfkit');
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock'),
}));

describe('Feature Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      params: {},
      query: {},
      body: {},
      user: { id: 1, role: 'ADMIN' } as any,
      ip: '127.0.0.1',
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('AnalyticsController', () => {
    const controller = new AnalyticsController();

    it('getDashboardStats should return stats', async () => {
      (prisma.user.count as jest.Mock).mockResolvedValue(10);
      (prisma.workshop.count as jest.Mock).mockResolvedValue(5);
      (prisma.registration.count as jest.Mock).mockResolvedValue(20);
      (prisma.payment.aggregate as jest.Mock).mockResolvedValue({ _sum: { amount: 1000 } });
      (prisma.registration.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.workshop.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      await controller.getDashboardStats(mockReq as any, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          overview: expect.objectContaining({ totalUsers: 10 }),
        }),
      }));
    });
  });

  describe('AuditLogController', () => {
    const controller = new AuditLogController();

    it('getAuditLogs should return logs', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([{ id: 1, action: 'test' }]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      await controller.getAuditLogs(mockReq as any, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ 
          logs: expect.any(Array) 
        }),
      }));
    });
  });

  describe('CertificateController', () => {
    const controller = new CertificateController();

    it('getMyCertificates should return certificates', async () => {
      (prisma.certificate.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
      
      await controller.getMyCertificates(mockReq as any, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ 
          certificates: expect.any(Array) 
        }),
      }));
    });

    it('downloadCertificate should generate PDF', async () => {
      mockReq.params = { id: 'cert-123' };
      (mockReq as any).user = { id: 1, role: 'ADMIN' };
      (prisma.certificate.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 1,
        user: { name: 'Test User' },
        workshop: { title: 'Test Workshop', speaker: { name: 'Speaker' } },
        issuedAt: new Date(),
        certificateNumber: 'cert-123',
      });

      // Mock PDFKit
      const mockDoc = {
        pipe: jest.fn(),
        rect: jest.fn().mockReturnThis(),
        stroke: jest.fn().mockReturnThis(),
        fontSize: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        moveDown: jest.fn().mockReturnThis(),
        font: jest.fn().mockReturnThis(),
        end: jest.fn(),
        page: { width: 100, height: 100 },
      };
      (PDFDocument as unknown as jest.Mock).mockImplementation(() => mockDoc);

      await controller.downloadCertificate(mockReq as any, mockRes as Response);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockDoc.end).toHaveBeenCalled();
    });
  });

  describe('SessionController', () => {
    const controller = new SessionController();

    it('createSession should create a session', async () => {
      mockReq.params = { workshopId: '1' };
      mockReq.body = { title: 'Session 1', sessionDate: '2023-01-01' };
      
      (prisma.workshop.findUnique as jest.Mock).mockResolvedValue({ id: 1, speakerId: 1 });
      (prisma.session.create as jest.Mock).mockResolvedValue({ id: 1, ...mockReq.body });

      // Mock ownership check (admin passes, speaker must match)
      (mockReq as any).user = { id: 1, role: 'SPEAKER' };

      await controller.createSession(mockReq as any, mockRes as Response);

      expect(prisma.session.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('generateAttendanceQR should return QR code', async () => {
      mockReq.params = { id: '1' };
      (prisma.session.findUnique as jest.Mock).mockResolvedValue({ id: 1, workshop: { speakerId: 1 } });
      (prisma.session.update as jest.Mock).mockResolvedValue({});
      (mockReq as any).user = { id: 1, role: 'SPEAKER' };

      await controller.generateAttendanceQR(mockReq as any, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ qrCodeImage: expect.stringContaining('data:image') }),
      }));
    });
  });
});
