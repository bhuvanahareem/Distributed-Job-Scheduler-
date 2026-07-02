import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import { authRouter } from './routes/auth.js';
import { queuesRouter } from './routes/queues.js';
import { jobsRouter } from './routes/jobs.js';
import { executionsRouter } from './routes/executions.js';
import { logsRouter } from './routes/logs.js';
import { statsRouter } from './routes/stats.js';
import { workersRouter } from './routes/workers.js';
import { projectsRouter } from './routes/projects.js';

import { authMiddleware } from './middleware/auth.js';
import { AppError } from './lib/errors.js';

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
app.use(cors({
  origin: allowedOrigins === '*' ? '*' : allowedOrigins.split(','),
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/projects', authMiddleware, projectsRouter);
app.use('/api/queues', authMiddleware, queuesRouter);
app.use('/api/jobs', authMiddleware, jobsRouter);
app.use('/api/executions', authMiddleware, executionsRouter);
app.use('/api/logs', authMiddleware, logsRouter);
app.use('/api/stats', authMiddleware, statsRouter);
app.use('/api/workers', authMiddleware, workersRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Express 5 native async error handling ensures this gets hit
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
