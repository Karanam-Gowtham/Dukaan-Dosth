import { Router } from 'express';
import { createTransaction, getTransactions, getTodayTransactions } from '../controllers/transactionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', (req, res) => createTransaction(req, res));
router.get('/', (req, res) => getTransactions(req, res));
router.get('/today', (req, res) => getTodayTransactions(req, res));

export default router;
