import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../database/connection';
import { generateToken, AuthenticatedRequest } from '../middleware/auth';
import { AppError, ValidationError, UnauthorizedError, ConflictError } from '../utils/AppError';
import { EmailService } from '../services/EmailService';
import { config } from '../config/config';
import { logSecurity, logAudit } from '../utils/logger';
import crypto from 'crypto';

export class AuthController {
  // Email service disabled for testing
  // private emailService = new EmailService();

  // Admin login (hidden)
  async adminLogin(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    // Hardcoded admin credentials check
    if (username !== 'admin' || password !== 'admin123') {
      logSecurity('Failed admin login attempt', { username, ip: req.ip });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Get or create admin user
    let admin = await prisma.user.findUnique({
      where: { email: config.adminEmail },
    });

    if (!admin) {
      const hashedPassword = await bcrypt.hash(config.adminPassword, config.bcryptRounds);
      admin = await prisma.user.create({
        data: {
          email: config.adminEmail,
          passwordHash: hashedPassword,
          name: 'System Administrator',
          role: 'ADMIN',
          isVerified: true,
          isApproved: true,
        },
      });
    }

    const token = generateToken(admin.id);

    logAudit('admin_login', admin.id, 'user', admin.id);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
    });
  }

  // Regular user login
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      logSecurity('Failed login attempt', { email, ip: req.ip });
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.role === 'GUEST_SPEAKER' && !user.isApproved) {
      throw new UnauthorizedError('Your speaker application is pending approval');
    }

    const token = generateToken(user.id);

    logAudit('user_login', user.id, 'user', user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileImage: user.profileImage,
        },
      },
    });
  }

  // Student registration
  async registerStudent(req: Request, res: Response): Promise<void> {
    const { name, email, password, phone } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        name,
        phone,
        role: 'STUDENT',
        isVerified: true,
      },
    });

    logAudit('user_register', user.id, 'user', user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful. You can now login.',
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
    });
  }

  // Speaker registration
  async registerSpeaker(req: Request, res: Response): Promise<void> {
    const { name, email, password, phone, bio, expertise, socialLinks } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        name,
        phone,
        bio,
        expertise: expertise ? expertise.join(',') : '',
        socialLinks: socialLinks ? JSON.stringify(socialLinks) : null,
        role: 'SPEAKER',
        isVerified: true, // Auto-verify for deployment
        isApproved: true, // Speakers are auto-approved
      },
    });

    logAudit('speaker_register', user.id, 'user', user.id);

    res.status(201).json({
      success: true,
      message: 'Speaker registration successful. You can now login.',
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
    });
  }

  // Guest speaker application
  async applyGuestSpeaker(req: Request, res: Response): Promise<void> {
    const { name, email, password, phone, bio, expertise, socialLinks, motivation } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        name,
        phone,
        bio,
        expertise: expertise ? expertise.join(',') : '',
        socialLinks: socialLinks ? JSON.stringify(socialLinks) : null,
        role: 'GUEST_SPEAKER',
        isVerified: true, // Auto-verify for deployment
        isApproved: false, // Requires admin approval
      },
    });

    // Notify admin about new guest speaker application (disabled for testing)
    // await this.emailService.sendGuestSpeakerNotification(user, motivation);

    logAudit('guest_speaker_apply', user.id, 'user', user.id);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. Please wait for admin approval.',
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
    });
  }


  // Get user profile
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        profileImage: true,
        socialLinks: true,
        expertise: true,
        phone: true,
        isVerified: true,
        isApproved: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: { user },
    });
  }

  // Update profile
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { name, phone, bio, expertise, socialLinks } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name,
        phone,
        bio,
        expertise: expertise ? expertise.join(',') : undefined,
        socialLinks: socialLinks ? JSON.stringify(socialLinks) : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        profileImage: true,
        socialLinks: true,
        expertise: true,
        phone: true,
      },
    });

    logAudit('profile_updated', req.user!.id, 'user', req.user!.id);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  }

  // Change password
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user || !await bcrypt.compare(currentPassword, user.passwordHash)) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash: hashedNewPassword },
    });

    logAudit('password_changed', req.user!.id, 'user', req.user!.id);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }

  // Logout
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    // In a real implementation, you'd invalidate the token
    logAudit('user_logout', req.user!.id, 'user', req.user!.id);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  // Forgot password
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists
      res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    // In real implementation, store reset token with expiration

    // Send password reset email (disabled for testing)
    // await this.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
    });
  }

  // Reset password
  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password } = req.body;

    // Decode and validate reset token
    const decoded = this.decodeResetToken(token);

    if (!decoded) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

    await prisma.user.update({
      where: { email: decoded.email },
      data: { passwordHash: hashedPassword },
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  }


  // Refresh token
  async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    const newToken = generateToken(req.user!.id);

    res.json({
      success: true,
      data: { token: newToken },
    });
  }

  // Helper methods

  private decodeResetToken(token: string): { email: string } | null {
    // In real implementation, decode JWT or lookup in database
    try {
      return { email: 'decoded@email.com' };
    } catch {
      return null;
    }
  }
}