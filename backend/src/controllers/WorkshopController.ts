import { createEvent, EventAttributes } from 'ics';
import { Request, Response } from 'express';
import { prisma } from '../database/connection';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError, ValidationError, NotFoundError, ConflictError } from '../utils/AppError';
import { logAudit } from '../utils/logger';

export class WorkshopController {
  // Get all workshops (public)
  async getWorkshops(req: Request, res: Response): Promise<void> {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      status = 'PUBLISHED',
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      status: status as string,
    };

    if (category) {
      where.category = {
        slug: category as string,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } }, // Removed mode: 'insensitive' for compatibility
        { description: { contains: search as string } },
      ];
    }

    const [workshops, total] = await Promise.all([
      prisma.workshop.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
        include: {
          category: true,
          speaker: {
            select: {
              id: true,
              name: true,
              bio: true,
              profileImage: true,
            },
          },
          _count: {
            select: {
              registrations: true,
              feedback: true,
            },
          },
        },
      }),
      prisma.workshop.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        workshops,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }

  // Get workshop by ID (public)
  async getWorkshopById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const workshop = await prisma.workshop.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        speaker: {
          select: {
            id: true,
            name: true,
            bio: true,
            profileImage: true,
            expertise: true,
            socialLinks: true,
          },
        },
        sessions: {
          orderBy: { sessionDate: 'asc' },
        },
        files: {
          where: { isPublic: true },
          select: {
            id: true,
            filename: true,
            originalName: true,
            fileType: true,
            fileSize: true,
          },
        },
        feedback: {
          where: { isAnonymous: false },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            registrations: true,
            feedback: true,
          },
        },
      },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    // Calculate average rating
    const avgRating = await prisma.feedback.aggregate({
      where: { workshopId: Number(id) },
      _avg: { rating: true },
    });

    res.json({
      success: true,
      data: {
        workshop: {
          ...workshop,
          averageRating: avgRating._avg.rating || 0,
        },
      },
    });
  }

  // Create workshop (Admin/Speaker)
  async createWorkshop(req: AuthenticatedRequest, res: Response): Promise<void> {
    const {
      title,
      description,
      categoryId,
      speakerId,
      price = 0,
      maxSeats,
      startDate,
      endDate,
      tags,
      requirements,
      learningOutcomes,
      sessions,
    } = req.body;

    // Check workshop limit for admin (20 workshops max)
    if (req.user!.role === 'ADMIN') {
      const workshopCount = await prisma.workshop.count();
      if (workshopCount >= 20) {
        throw new ConflictError('Maximum workshop limit (20) reached');
      }
    }

    // Validate speaker exists
    const speaker = await prisma.user.findUnique({
      where: { id: speakerId },
    });

    if (!speaker || !['SPEAKER', 'ADMIN'].includes(speaker.role)) {
      throw new ValidationError('Invalid speaker');
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new ValidationError('Invalid category');
    }

    const workshop = await prisma.workshop.create({
      data: {
        title,
        description,
        categoryId,
        speakerId,
        price: Number(price),
        maxSeats: maxSeats ? Number(maxSeats) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        tags: Array.isArray(tags) ? tags.join(',') : tags,
        requirements,
        learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes.join(',') : learningOutcomes,
        status: 'DRAFT',
      },
      include: {
        category: true,
        speaker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create sessions if provided
    if (sessions && Array.isArray(sessions)) {
      await prisma.session.createMany({
        data: sessions.map((session: any) => ({
          workshopId: workshop.id,
          title: session.title,
          description: session.description,
          sessionDate: new Date(session.sessionDate),
          startTime: session.startTime,
          endTime: session.endTime,
        })),
      });
    }

    logAudit('workshop_created', req.user!.id, 'workshop', workshop.id);

    res.status(201).json({
      success: true,
      message: 'Workshop created successfully',
      data: { workshop },
    });
  }

  // Update workshop (Admin/Speaker owner)
  async updateWorkshop(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const {
      title,
      description,
      categoryId,
      price,
      maxSeats,
      startDate,
      endDate,
      tags,
      requirements,
      learningOutcomes,
      status,
    } = req.body;

    const workshop = await prisma.workshop.findUnique({
      where: { id: Number(id) },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    // Check ownership (speaker can only edit their own workshops)
    if (req.user!.role === 'SPEAKER' && workshop.speakerId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    const updatedWorkshop = await prisma.workshop.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(categoryId && { categoryId }),
        ...(price !== undefined && { price: Number(price) }),
        ...(maxSeats !== undefined && { maxSeats: maxSeats ? Number(maxSeats) : null }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(tags && { tags: Array.isArray(tags) ? tags.join(',') : tags }),
        ...(requirements && { requirements }),
        ...(learningOutcomes && { 
          learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes.join(',') : learningOutcomes 
        }),
        ...(status && { status }),
      },
      include: {
        category: true,
        speaker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logAudit('workshop_updated', req.user!.id, 'workshop', workshop.id);

    res.json({
      success: true,
      message: 'Workshop updated successfully',
      data: { workshop: updatedWorkshop },
    });
  }

  // Delete workshop (Admin only)
  async deleteWorkshop(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const workshop = await prisma.workshop.findUnique({
      where: { id: Number(id) },
      include: {
        registrations: true,
      },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    if (workshop.registrations.length > 0) {
      throw new ConflictError('Cannot delete workshop with existing registrations');
    }

    await prisma.workshop.delete({
      where: { id: Number(id) },
    });

    logAudit('workshop_deleted', req.user!.id, 'workshop', Number(id));

    res.json({
      success: true,
      message: 'Workshop deleted successfully',
    });
  }

  // Get workshops by speaker (Speaker/Admin)
  async getWorkshopsBySpeaker(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { speakerId } = req.params;
    const targetSpeakerId = speakerId ? Number(speakerId) : req.user!.id;

    // Check access
    if (req.user!.role === 'SPEAKER' && targetSpeakerId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    const workshops = await prisma.workshop.findMany({
      where: { speakerId: targetSpeakerId },
      include: {
        category: true,
        _count: {
          select: {
            registrations: true,
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { workshops },
    });
  }

  // Publish workshop (Admin/Speaker owner)
  async publishWorkshop(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const workshop = await prisma.workshop.findUnique({
      where: { id: Number(id) },
      include: {
        sessions: true,
      },
    });

    if (!workshop) {
      throw new NotFoundError('Workshop not found');
    }

    // Check ownership
    if (req.user!.role === 'SPEAKER' && workshop.speakerId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    // Validate workshop has sessions
    if (workshop.sessions.length === 0) {
      throw new ValidationError('Workshop must have at least one session to be published');
    }

    await prisma.workshop.update({
      where: { id: Number(id) },
      data: { status: 'PUBLISHED' },
    });

    logAudit('workshop_published', req.user!.id, 'workshop', Number(id));

    res.json({
      success: true,
      message: 'Workshop published successfully',
    });
  }

  // Join Waitlist
  async joinWaitlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const workshopId = Number(id);
    const userId = req.user!.id;

    const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) throw new NotFoundError('Workshop not found');

    const existingRegistration = await prisma.registration.findUnique({
      where: { userId_workshopId: { userId, workshopId } },
    });
    if (existingRegistration) throw new ConflictError('Already registered');

    // Check if waitlist exists
    const existingWaitlist = await prisma.waitlist.findUnique({
      where: { userId_workshopId: { userId, workshopId } },
    });
    if (existingWaitlist) throw new ConflictError('Already on waitlist');

    await prisma.waitlist.create({
      data: { userId, workshopId },
    });

    res.status(201).json({ success: true, message: 'Added to waitlist' });
  }

  // Leave Waitlist
  async leaveWaitlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const workshopId = Number(id);
    const userId = req.user!.id;

    try {
      await prisma.waitlist.delete({
        where: { userId_workshopId: { userId, workshopId } },
      });
    } catch {
      throw new NotFoundError('Not on waitlist');
    }

    res.json({ success: true, message: 'Removed from waitlist' });
  }

  // Add to Calendar
  async addToCalendar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const workshop = await prisma.workshop.findUnique({ where: { id: Number(id) } });

    if (!workshop) throw new NotFoundError('Workshop not found');

    const event: EventAttributes = {
      start: [workshop.startDate.getFullYear(), workshop.startDate.getMonth() + 1, workshop.startDate.getDate(), workshop.startDate.getHours(), workshop.startDate.getMinutes()],
      duration: { hours: 2 }, // Approximation, real logic would subtract end - start
      title: workshop.title,
      description: workshop.description,
      location: 'Online',
      url: 'https://wms.com',
    };

    createEvent(event, (error, value) => {
      if (error) {
        throw new AppError('Failed to generate calendar event', 500);
      }
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', `attachment; filename="${workshop.title}.ics"`);
      res.send(value);
    });
  }

  // Get categories
  async getCategories(req: Request, res: Response): Promise<void> {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: { categories },
    });
  }

  // Create category (Admin only)
  async createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { name, description } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictError('Category already exists');
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
      },
    });

    logAudit('category_created', req.user!.id, 'category', category.id);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  }
}