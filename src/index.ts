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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
