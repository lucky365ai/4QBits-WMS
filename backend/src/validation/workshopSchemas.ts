import Joi from 'joi';
import { commonSchemas } from '../middleware/validation';

export const workshopSchemas = {
  // Create workshop
  createWorkshop: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(50).max(2000).required(),
    categoryId: Joi.number().integer().positive().required(),
    speakerId: Joi.number().integer().positive().optional(), // Admin can assign, speaker auto-assigned
    price: Joi.number().min(0).max(10000).default(0),
    maxSeats: Joi.number().integer().min(1).max(1000).optional(),
    startDate: commonSchemas.date,
    endDate: commonSchemas.date.min(Joi.ref('startDate')),
    tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
    requirements: Joi.string().max(1000).optional(),
    learningOutcomes: Joi.array().items(Joi.string().max(200)).max(10).optional(),
  }),

  // Update workshop
  updateWorkshop: Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    description: Joi.string().min(50).max(2000).optional(),
    categoryId: Joi.number().integer().positive().optional(),
    speakerId: Joi.number().integer().positive().optional(),
    price: Joi.number().min(0).max(10000).optional(),
    maxSeats: Joi.number().integer().min(1).max(1000).optional(),
    startDate: commonSchemas.date.optional(),
    endDate: Joi.date().iso().optional(),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED').optional(),
    tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
    requirements: Joi.string().max(1000).optional(),
    learningOutcomes: Joi.array().items(Joi.string().max(200)).max(10).optional(),
  }),

  // Workshop query filters
  workshopQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    search: Joi.string().max(100).optional(),
    category: Joi.string().optional(),
    speaker: Joi.string().optional(),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED').optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    sortBy: Joi.string().valid('title', 'price', 'startDate', 'createdAt', 'rating').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    tags: Joi.array().items(Joi.string()).optional(),
  }),

  // Create session
  createSession: Joi.object({
    workshopId: Joi.number().integer().positive().required(),
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).optional(),
    sessionDate: commonSchemas.date,
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  }),

  // Update session
  updateSession: Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    sessionDate: commonSchemas.date.optional(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  }),

  // Workshop registration
  registerWorkshop: Joi.object({
    workshopId: Joi.number().integer().positive().required(),
  }),

  // Mark attendance
  markAttendance: Joi.object({
    sessionId: Joi.number().integer().positive().required(),
    qrCode: Joi.string().required(),
  }),

  // Submit feedback
  submitFeedback: Joi.object({
    workshopId: Joi.number().integer().positive().required(),
    rating: commonSchemas.rating,
    comment: Joi.string().max(1000).optional(),
    isAnonymous: Joi.boolean().default(false),
  }),

  // Update feedback
  updateFeedback: Joi.object({
    rating: commonSchemas.rating.optional(),
    comment: Joi.string().max(1000).optional(),
    isAnonymous: Joi.boolean().optional(),
  }),
};