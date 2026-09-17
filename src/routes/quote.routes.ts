import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET all quotes (protected - only admin should see all quotes)
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.quoteRequest.findMany({
      include: { product: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// POST submit quote (public - anyone can submit)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, name, company, phone, email, interestedProduct, productId, message } = req.body;
    const request = await prisma.quoteRequest.create({
      data: {
        type: type || 'CONTACT',
        name,
        company,
        phone,
        email,
        interestedProduct,
        productId,
        message,
      },
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// PUT update quote status (protected)
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;
    
    const updatedRequest = await prisma.quoteRequest.update({
      where: { id },
      data: { status, notes },
    });
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update quote request' });
  }
});

export default router;
