import { Router } from 'express';

const router = Router();

// Placeholder payment routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Payment routes - coming soon',
    data: { payments: [] }
  });
});

export { router as paymentRoutes };