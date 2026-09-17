import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all news (public)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const news = await prisma.news.findMany({
      include: {
        category: true,
        author: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// GET single news (public)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const newsItem = await prisma.news.findUnique({
      where: { id },
      include: { category: true, author: { select: { name: true } } },
    });
    if (!newsItem) {
      res.status(404).json({ error: 'News not found' });
      return;
    }
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// POST create news (protected)
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, slug, content, excerpt, coverImage, categoryId, isPublished, publishedAt } = req.body;
    const authorId = req.user!.id;

    const newsItem = await prisma.news.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        categoryId,
        authorId,
        isPublished: isPublished ?? false,
        publishedAt: publishedAt ? new Date(publishedAt) : null
      },
    });
    res.status(201).json(newsItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// PUT update news (protected)
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, slug, content, excerpt, coverImage, categoryId, isPublished, publishedAt } = req.body;
    
    const newsItem = await prisma.news.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        categoryId,
        isPublished,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined
      },
    });
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update news' });
  }
});

// DELETE news (protected)
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.news.delete({ where: { id } });
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

export default router;
