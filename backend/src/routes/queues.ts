import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { retry_strategy } from '@prisma/client';

export const queuesRouter = Router();

queuesRouter.get('/', async (req, res) => {
  if (!req.user?.org_id) return res.json([]);
  
  const queues = await prisma.queues.findMany({
    where: { project: { org_id: req.user.org_id } },
    include: {
      _count: { select: { jobs: true } }
    },
    orderBy: { priority: 'desc' }
  });
  res.json(queues);
});

queuesRouter.get('/:id', async (req, res) => {
  const queue = await prisma.queues.findUnique({
    where: { id: req.params.id },
    include: { project: true }
  });
  if (!queue) throw new AppError('Queue not found', 404);
  
  const counts = await prisma.jobs.groupBy({
    by: ['status'],
    where: { queue_id: queue.id },
    _count: true
  });
  
  res.json({ queue, counts });
});

const createSchema = z.object({
  name: z.string().min(1),
  project_id: z.string().uuid(),
  priority: z.number().optional(),
  concurrency_limit: z.number().optional(),
  retry_limit: z.number().optional(),
  backoff_strategy: z.enum(['FIXED', 'LINEAR', 'EXPONENTIAL']).optional(),
  backoff_delay_seconds: z.number().optional()
});

queuesRouter.post('/', async (req, res) => {
  const data = createSchema.parse(req.body);
  const queue = await prisma.queues.create({
    data: {
      ...data,
      backoff_strategy: data.backoff_strategy as retry_strategy | undefined
    }
  });
  res.status(201).json(queue);
});

const updateSchema = createSchema.partial().omit({ project_id: true });

queuesRouter.patch('/:id', async (req, res) => {
  const data = updateSchema.parse(req.body);
  const queue = await prisma.queues.update({
    where: { id: req.params.id },
    data: {
      ...data,
      backoff_strategy: data.backoff_strategy as retry_strategy | undefined
    }
  });
  res.json(queue);
});

queuesRouter.patch('/:id/pause', async (req, res) => {
  const zBool = z.object({ is_paused: z.boolean() });
  const { is_paused } = zBool.parse(req.body);
  
  const queue = await prisma.queues.update({
    where: { id: req.params.id },
    data: { is_paused }
  });
  res.json(queue);
});

queuesRouter.delete('/:id', async (req, res) => {
  await prisma.queues.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
