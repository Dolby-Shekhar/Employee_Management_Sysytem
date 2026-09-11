import express from 'express';
import { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import leaveRoutes from './routes/leaveRoutes';
import payrollRoutes from './routes/payrollRoutes';
import performanceRoutes from './routes/performanceRoutes';
import reportRoutes from './routes/reportRoutes';
import profileRoutes from './routes/profileRoutes';
import { initSocket } from './utils/socket';

dotenv.config();

// Validate required environment variables
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
});

const app = express();
export default app;
const port = parseInt(process.env.PORT || '5000', 10);

app.set('trust proxy', 1);

app.use(helmet());
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);

// Ensure logs directory exists
fs.mkdirSync(path.resolve(__dirname, '..', 'logs'), { recursive: true });
app.use(morgan('combined', { stream: fs.createWriteStream(path.resolve(__dirname, '..', 'logs', 'access.log'), { flags: 'a' }) }));
// Serve React frontend static files
app.use(express.static(path.resolve(__dirname, '..', 'public')));
// Catch‑all for SPA moved below API routes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false });
app.use(globalLimiter);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'EMS API is running' });
});

// Simple health‑check for Render
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/performance', performanceRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/profile', profileRoutes);

// Catch‑all for SPA (must be after API routes)
const indexHtml = path.resolve(__dirname, '..', 'public', 'index.html');
app.get('*', (req: Request, res: Response) => {
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(404).json({ success: false, message: 'Frontend build not found. API is running.' });
  }
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

if (require.main === module) {
  connectDB().then(() => {
    const server = http.createServer(app);
    initSocket(server);
    server.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  });
}

