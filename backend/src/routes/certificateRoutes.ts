import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { CertificateController } from '../controllers/CertificateController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const certificateController = new CertificateController();

router.use(authenticate);

// Get my certificates (This route conflicts with the pattern in frontend code which uses /users/certificates)
// So I will make sure main routes point /users/certificates to this controller logic, OR just expose it here.
// But wait, the Frontend fetches from `/users/certificates`.
// I should update userRoutes for that, OR add a new route here and update frontend.
// Let's stick to cleaning up: dedicated route file is better.

router.get('/my-certificates', asyncHandler(certificateController.getMyCertificates.bind(certificateController)));
router.get('/:id/download', asyncHandler(certificateController.downloadCertificate.bind(certificateController)));

export { router as certificateRoutes };
