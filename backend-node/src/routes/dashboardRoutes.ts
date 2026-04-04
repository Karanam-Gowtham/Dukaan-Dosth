import { Router } from 'express';
import { getTodaySummary, getRecent } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/today', (req, res) => getTodaySummary(req, res));
router.get('/recent', (req, res) => getRecent(req, res));

export default router;
