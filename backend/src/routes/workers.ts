import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const workersRouter = Router();

workersRouter.get('/', async (req, res) => {
  const workers = await prisma.workers.findMany({
    include: {
      _count: {
        select: {
          jobs: { where: { status: { in: ['CLAIMED', 'RUNNING'] } } }
        }
      }
    },
    orderBy: { last_heartbeat_at: 'desc' }
  });
  
  res.json(workers);
});
