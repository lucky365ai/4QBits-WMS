import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { workshopRoutes } from './workshopRoutes';
import { registrationRoutes } from './registrationRoutes';
import { adminRoutes } from './adminRoutes';
import { userRoutes } from './userRoutes';
import { paymentRoutes } from './paymentRoutes';
import { fileRoutes } from './fileRoutes';
import { certificateRoutes } from './certificateRoutes';
import { publicRoutes } from './publicRoutes';

const router = Router();

// Public routes (no authentication required)
router.use('/public', publicRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// User routes (authenticated users)
router.use('/users', userRoutes);

// Workshop routes
router.use('/workshops', workshopRoutes);

// Registration routes
router.use('/registrations', registrationRoutes);

// Payment routes
router.use('/payments', paymentRoutes);

// Certificate routes
router.use('/certificates', certificateRoutes);

// File upload/download routes
router.use('/files', fileRoutes);

// Admin routes (hidden and protected)
router.use('/admin', adminRoutes);

export { router as routes };