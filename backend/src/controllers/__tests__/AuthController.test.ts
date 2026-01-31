import { Request, Response } from 'express';
import { AuthController } from '../../controllers/AuthController';
import { prisma } from '../../database/connection';
import { EmailService } from '../../services/EmailService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../database/connection', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../services/EmailService');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
  let controller: AuthController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    controller = new AuthController();
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'STUDENT',
        isVerified: true,
      };

      mockReq.body = { email: 'test@example.com', password: 'password123' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await controller.login(mockReq as Request, mockRes as Response);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({ email: 'test@example.com' }),
        }),
      }));
    });

    it('should fail with invalid credentials', async () => {
      mockReq.body = { email: 'test@example.com', password: 'wrongpassword' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        passwordHash: 'hashed',
        isVerified: true
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(controller.login(mockReq as Request, mockRes as Response))
        .rejects.toThrow('Invalid email or password');
    });
  });

  describe('registerStudent', () => {
    it('should register a new student', async () => {
      mockReq.body = {
        email: 'student@example.com',
        password: 'Password123!',
        name: 'Student Name',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 1,
        ...mockReq.body,
        role: 'STUDENT',
      });
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await controller.registerStudent(mockReq as Request, mockRes as Response);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });
});
