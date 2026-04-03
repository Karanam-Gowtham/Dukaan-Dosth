import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const createTransaction = async (req: AuthRequest, res: Response) => {
  const { amount, description, type, category, customerName } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const tx = await prisma.transaction.create({
      data: {
        amount,
        description,
        type,
        category,
        customerName,
        userId: userId,
      },
    });
    return res.status(201).json(tx);
  } catch (err) {
    console.error('Create Transaction Error:', err);
    return res.status(500).json({ message: 'Server error creating transaction' });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

export const getTodayTransactions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
