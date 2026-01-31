import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: config.fromEmail,
      to: email,
      subject: 'Verify Your Email - Workshop Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Workshop Management System!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated email from Workshop Management System. Please do not reply.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: config.fromEmail,
      to: email,
      subject: 'Reset Your Password - Workshop Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated email from Workshop Management System. Please do not reply.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendGuestSpeakerNotification(user: any, motivation: string): Promise<void> {
    const adminEmail = config.adminEmail;

    const mailOptions = {
      from: config.fromEmail,
      to: adminEmail,
      subject: 'New Guest Speaker Application - Workshop Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Guest Speaker Application</h2>
          <p>A new guest speaker has applied to join the platform:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Applicant Details:</h3>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
            <p><strong>Bio:</strong> ${user.bio}</p>
            <p><strong>Expertise:</strong> ${user.expertise?.join(', ') || 'Not provided'}</p>
            <p><strong>Motivation:</strong> ${motivation}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.frontendUrl}/admin/speakers/pending" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Review Application
            </a>
          </div>

          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from Workshop Management System.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Guest speaker notification sent to admin`);
    } catch (error) {
      logger.error('Failed to send guest speaker notification:', error);
      // Don't throw error as this is not critical
    }
  }

  async sendWorkshopRegistrationConfirmation(
    email: string, 
    name: string, 
    workshop: any, 
    registrationId: string
  ): Promise<void> {
    const mailOptions = {
      from: config.fromEmail,
      to: email,
      subject: `Registration Confirmed - ${workshop.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Workshop Registration Confirmed!</h2>
          <p>Hello ${name},</p>
          <p>Your registration for the following workshop has been confirmed:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>${workshop.title}</h3>
            <p><strong>Date:</strong> ${new Date(workshop.startDate).toLocaleDateString()}</p>
            <p><strong>Speaker:</strong> ${workshop.speaker?.name}</p>
            <p><strong>Price:</strong> $${workshop.price}</p>
            <p><strong>Registration ID:</strong> ${registrationId}</p>
          </div>

          <p>You will receive further details about the workshop location and materials closer to the date.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.frontendUrl}/my-registrations" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View My Registrations
            </a>
          </div>

          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated email from Workshop Management System. Please do not reply.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Registration confirmation sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send registration confirmation:', error);
      throw new Error('Failed to send registration confirmation');
    }
  }

  async sendCertificateNotification(
    email: string, 
    name: string, 
    workshop: any, 
    certificateUrl: string
  ): Promise<void> {
    const mailOptions = {
      from: config.fromEmail,
      to: email,
      subject: `Certificate Ready - ${workshop.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🎉 Your Certificate is Ready!</h2>
          <p>Hello ${name},</p>
          <p>Congratulations! Your certificate for completing the workshop is now available:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>${workshop.title}</h3>
            <p><strong>Completed on:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Speaker:</strong> ${workshop.speaker?.name}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${certificateUrl}" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Download Certificate
            </a>
          </div>

          <p>You can also access your certificate anytime from your dashboard.</p>

          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated email from Workshop Management System. Please do not reply.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Certificate notification sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send certificate notification:', error);
      // Don't throw error as this is not critical
    }
  }
}