import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import quoteRoutes from './routes/quote.routes';
import portfolioRoutes from './routes/portfolio.routes';
import portfolioCategoryRoutes from './routes/portfolio-category.routes';
import newsRoutes from './routes/news.routes';
import newsCategoryRoutes from './routes/news-category.routes';
import settingsRoutes from './routes/settings.routes';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  })
);
app.use(express.json());

import uploadRoutes from './routes/upload.routes';
import path from 'path';

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/portfolio-categories', portfolioCategoryRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/news-categories', newsCategoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Reacharis Backend API is running' });
});

// Reports whether the service can actually reach the database. Only the error
// code and name are exposed, never the connection string or its credentials.
app.get('/api/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error: any) {
    console.error(error);
    res.status(503).json({
      status: 'error',
      database: 'unreachable',
      code: error?.code ?? null,
      name: error?.name ?? null,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
