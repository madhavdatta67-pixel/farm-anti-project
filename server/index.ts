import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDbSchema } from './config/db.js';
import authRoutes from './routes/auth.js';
import fieldRoutes from './routes/fields.js';
import advisoryRoutes from './routes/advisory.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware Setup
app.use(cors());

// Express payload limit set to 10mb to support Base64 field images safely
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'AgriTech Advisory API Engine', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/advisory', advisoryRoutes);

// Serve Static Frontend Assets in Production
const clientDistPath = path.resolve(__dirname, '../../dist/client');
app.use(express.static(clientDistPath));

app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('AgriTech API Server Running. Start Vite client for UI.');
    }
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Server & Initialize Database
async function startServer() {
  try {
    await initDbSchema();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🌾 AgriTech Crop Advisory Assistant API Server`);
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
