import { Router } from 'express';

const router = Router();

// Public routes (no authentication required)
router.get('/workshops', (req, res) => {
  res.json({
    success: true,
    message: 'Public workshops',
    data: { workshops: [] }
  });
});

router.get('/categories', (req, res) => {
  res.json({
    success: true,
    message: 'Workshop categories',
    data: { categories: [] }
  });
});

export { router as publicRoutes };