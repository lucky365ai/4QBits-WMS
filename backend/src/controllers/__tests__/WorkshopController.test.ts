import { Request, Response } from 'express';
import { WorkshopController } from '../../controllers/WorkshopController';
import { prisma } from '../../database/connection';

// Mock Prisma
jest.mock('../../database/connection', () => ({
  prisma: {
    workshop: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    session: {
      createMany: jest.fn(),
    },
  },
}));

describe('WorkshopController', () => {
  let controller: WorkshopController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    controller = new WorkshopController();
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getWorkshops', () => {
    it('should return a list of workshops with pagination', async () => {
      mockReq.query = { page: '1', limit: '10' };
      const mockWorkshops = [{ id: 1, title: 'Test Workshop' }];
      const mockCount = 1;

      (prisma.workshop.findMany as jest.Mock).mockResolvedValue(mockWorkshops);
      (prisma.workshop.count as jest.Mock).mockResolvedValue(mockCount);

      await controller.getWorkshops(mockReq as Request, mockRes as Response);

      expect(prisma.workshop.findMany).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          workshops: mockWorkshops,
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            pages: 1,
          },
        },
      });
    });
  });

  describe('createWorkshop', () => {
    it('should create a new workshop', async () => {
      mockReq.body = {
        title: 'New Workshop',
        description: 'Description',
        categoryId: 1,
        speakerId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-02',
      };
      // Mock authenticated user
      (mockReq as any).user = { role: 'SPEAKER', id: 1 };

      const mockSpeaker = { id: 1, role: 'SPEAKER' };
      const mockCategory = { id: 1, name: 'Tech' };
      const mockCreatedWorkshop = { id: 1, ...mockReq.body };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockSpeaker);
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.workshop.create as jest.Mock).mockResolvedValue(mockCreatedWorkshop);

      await controller.createWorkshop(mockReq as any, mockRes as Response);

      expect(prisma.workshop.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Workshop created successfully',
      }));
    });
    
    it('should fail if speaker is invalid', async () => {
       mockReq.body = {
        title: 'New Workshop',
        categoryId: 1,
        speakerId: 999,
      };
      (mockReq as any).user = { role: 'SPEAKER', id: 1 };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // No speaker

      await expect(controller.createWorkshop(mockReq as any, mockRes as Response))
        .rejects.toThrow('Invalid speaker');
    });
  });
});
