import Joi from 'joi';
import { commonSchemas } from '../middleware/validation';

export const authSchemas = {
  // Admin login (hidden)
  adminLogin: Joi.object({
    username: Joi.string().valid('admin').required(),
    password: Joi.string().valid('admin123').required(),
  }),

  // Regular user login
  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required(),
  }),

  // Student registration
  studentRegister: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: commonSchemas.email,
    password: commonSchemas.password,
    phone: commonSchemas.phone,
  }),

  // Speaker registration
  speakerRegister: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: commonSchemas.email,
    password: commonSchemas.password,
    phone: commonSchemas.phone,
    bio: Joi.string().max(1000).optional(),
    expertise: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    socialLinks: Joi.object({
      linkedin: commonSchemas.url,
      twitter: commonSchemas.url,
      github: commonSchemas.url,
      website: commonSchemas.url,
    }).optional(),
  }),

  // Guest speaker application
  guestSpeakerApply: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: commonSchemas.email,
    password: commonSchemas.password,
    phone: commonSchemas.phone,
    bio: Joi.string().min(50).max(1000).required(),
    expertise: Joi.array().items(Joi.string().max(50)).min(1).max(10).required(),
    socialLinks: Joi.object({
      linkedin: commonSchemas.url,
      twitter: commonSchemas.url,
      github: commonSchemas.url,
      website: commonSchemas.url,
    }).optional(),
    motivation: Joi.string().min(100).max(500).required(),
  }),

  // Password reset request
  forgotPassword: Joi.object({
    email: commonSchemas.email,
  }),

  // Password reset
  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: commonSchemas.password,
  }),

  // Change password
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password,
  }),

  // Update profile
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: commonSchemas.phone,
    bio: Joi.string().max(1000).optional(),
    expertise: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    socialLinks: Joi.object({
      linkedin: commonSchemas.url,
      twitter: commonSchemas.url,
      github: commonSchemas.url,
      website: commonSchemas.url,
    }).optional(),
  }),

};