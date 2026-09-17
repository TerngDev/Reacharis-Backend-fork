import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET all portfolio items (public)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(portfolios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

// GET single portfolio (public)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!portfolio) {
      res.status(404).json({ error: 'Portfolio not found' });
      return;
    }
    res.json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// POST create portfolio (protected)
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, clientName, description, coverImage, completionDate, categoryId } = req.body;
    const portfolio = await prisma.portfolio.create({
      data: {
        title,
        slug,
        clientName,
        description,
        coverImage,
        completionDate: completionDate ? new Date(completionDate) : null,
        categoryId
      },
    });
    res.status(201).json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create portfolio' });
  }
});

// PUT update portfolio (protected)
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, slug, clientName, description, coverImage, completionDate, categoryId } = req.body;
    
    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        title,
        slug,
        clientName,
        description,
        coverImage,
        completionDate: completionDate ? new Date(completionDate) : null,
        categoryId
      },
    });
    res.json(portfolio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update portfolio' });
  }
});

// DELETE portfolio (protected)
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.portfolio.delete({ where: { id } });
    res.json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete portfolio' });
  }
});

export default router;
