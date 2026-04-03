import { Router } from 'express';
import { getTodaySummary, getRecent } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/today', (req, res) => getTodaySummary(req, res));
router.get('/recent', (req, res) => getRecent(req, res));

export default router;
