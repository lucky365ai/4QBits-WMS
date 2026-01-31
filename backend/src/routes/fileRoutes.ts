import { Router } from 'express';

const router = Router();

// Placeholder file routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'File routes - coming soon',
    data: { files: [] }
  });
});

export { router as fileRoutes };