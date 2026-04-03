import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => register(req, res));
router.post('/login', (req, res) => login(req, res));
router.get('/me', authMiddleware, (req, res) => getMe(req, res));

export default router;
