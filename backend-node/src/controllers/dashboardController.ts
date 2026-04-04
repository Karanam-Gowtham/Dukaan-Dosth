import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getTodaySummary = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const todayTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const todaySales = todayTransactions
      .filter((tx: any) => tx.type === 'SALE')
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);

    const todayExpenses = todayTransactions
      .filter((tx: any) => tx.type === 'EXPENSE')
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);

    const pendingUdhaar = todayTransactions
      .filter((tx: any) => tx.type === 'CREDIT_GIVEN')
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);

    const netProfit = todaySales - todayExpenses;

    return res.json({
      todaySales,
      todayExpenses,
      netProfit,
      pendingUdhaar,
    });
  } catch (err) {
    console.error('Dashboard Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getRecent = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
