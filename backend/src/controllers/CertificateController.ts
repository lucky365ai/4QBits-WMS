import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { prisma } from '../database/connection';
import { AuthenticatedRequest } from '../middleware/auth';
import { NotFoundError, AppError } from '../utils/AppError';
import path from 'path';
import fs from 'fs';

export class CertificateController {
  // Get my certificates
  async getMyCertificates(req: AuthenticatedRequest, res: Response): Promise<void> {
    const certificates = await prisma.certificate.findMany({
      where: { userId: req.user!.id },
      include: {
        workshop: {
          select: {
            id: true,
            title: true,
            speaker: { select: { name: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    res.json({
      success: true,
      data: { certificates },
    });
  }

  // Download certificate (Generate PDF on the fly)
  async downloadCertificate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params; // certificateId string (UUID or similar)

    const certificate = await prisma.certificate.findUnique({
      where: { certificateNumber: id },
      include: {
        user: true,
        workshop: {
          include: {
            speaker: true,
          }
        },
      },
    });

    if (!certificate) {
      throw new NotFoundError('Certificate not found');
    }

    // Check ownership (or admin)
    if (certificate.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('Access denied', 403);
    }

    // Create PDF
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
    });

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${id}.pdf"`);

    doc.pipe(res);

    // Design
    // Background border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

    // Title
    doc.fontSize(30).text('CERTIFICATE OF COMPLETION', 0, 100, { align: 'center' });
    
    // Body
    doc.moveDown();
    doc.fontSize(15).text('This is to certify that', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(25).font('Helvetica-Bold').text(certificate.user.name, { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(15).font('Helvetica').text('has successfully completed the workshop', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(20).font('Helvetica-Bold').text(certificate.workshop.title, { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(15).font('Helvetica').text(`Conducted by ${certificate.workshop.speaker.name}`, { align: 'center' });
    
    doc.moveDown(2);
    doc.fontSize(12).text(`Issued on: ${certificate.issuedAt.toLocaleDateString()}`, { align: 'center' });
    doc.text(`Certificate ID: ${certificate.certificateNumber}`, { align: 'center' });

    // Finalize
    doc.end();
  }
}
