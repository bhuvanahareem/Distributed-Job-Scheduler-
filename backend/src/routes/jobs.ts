import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { paginate, paginatedResponse } from '../lib/pagination.js';
import cronParser from 'cron-parser';
import { job_status } from '@prisma/client';

export const jobsRouter = Router();

jobsRouter.get('/', async (req, res) => {
  const { status, queue_id, page, pageSize } = req.query;
  const { skip, take, page: p, pageSize: ps } = paginate(page as string, pageSize as string);
  
  const where: any = {};
  if (status) where.status = status;
  if (queue_id) where.queue_id = queue_id;
  
  // Ensure user only sees jobs from their org
  if (req.user?.org_id) {
    where.queue = { project: { org_id: req.user.org_id } };
  }

  const [total, jobs] = await Promise.all([
    prisma.jobs.count({ where }),
    prisma.jobs.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: { queue: { select: { name: true } } }
    })
  ]);

  res.json(paginatedResponse(jobs, total, p, ps));
});

jobsRouter.get('/:id', async (req, res) => {
  const job = await prisma.jobs.findUnique({
    where: { id: req.params.id },
    include: {
      queue: true,
      job_executions: { orderBy: { started_at: 'desc' } },
      job_logs: { orderBy: { created_at: 'desc' } }
    }
  });
  if (!job) throw new AppError('Job not found', 404);
  res.json(job);
});

const createJobSchema = z.object({
  queue_id: z.string().uuid(),
  payload: z.any(),
  type: z.enum(['immediate', 'delayed', 'cron']),
  run_at: z.string().datetime().optional(),
  cron_expression: z.string().optional()
});

jobsRouter.post('/', async (req, res) => {
  const data = createJobSchema.parse(req.body);
  
  let status: job_status = 'QUEUED';
  let run_at = new Date();
  
  if (data.type === 'delayed') {
    if (!data.run_at) throw new AppError('run_at required for delayed jobs', 400);
    status = 'SCHEDULED';
    run_at = new Date(data.run_at);
  } else if (data.type === 'cron') {
    if (!data.cron_expression) throw new AppError('cron_expression required for cron jobs', 400);
    try {
      const interval = cronParser.parseExpression(data.cron_expression);
      status = 'SCHEDULED';
      run_at = interval.next().toDate();
    } catch (e) {
      throw new AppError('Invalid cron expression', 400);
    }
  }

  const job = await prisma.jobs.create({
    data: {
      queue_id: data.queue_id,
      payload: data.payload,
      status,
      run_at,
      cron_expression: data.type === 'cron' ? data.cron_expression : null
    }
  });

  res.status(201).json(job);
});

jobsRouter.post('/batch', async (req, res) => {
  const schema = z.array(createJobSchema);
  const dataList = schema.parse(req.body);
  
  const jobsData = dataList.map(data => {
    let status: job_status = 'QUEUED';
    let run_at = new Date();
    
    if (data.type === 'delayed') {
      status = 'SCHEDULED';
      run_at = new Date(data.run_at!);
    } else if (data.type === 'cron') {
      const interval = cronParser.parseExpression(data.cron_expression!);
      status = 'SCHEDULED';
      run_at = interval.next().toDate();
    }
    
    return {
      queue_id: data.queue_id,
      payload: data.payload,
      status,
      run_at,
      cron_expression: data.type === 'cron' ? data.cron_expression : null
    };
  });

  const result = await prisma.jobs.createMany({ data: jobsData });
  res.status(201).json({ count: result.count });
});

jobsRouter.post('/:id/retry', async (req, res) => {
  const job = await prisma.jobs.findUnique({ where: { id: req.params.id } });
  if (!job) throw new AppError('Job not found', 404);
  if (job.status !== 'FAILED') throw new AppError('Can only retry FAILED jobs', 400);

  const updatedJob = await prisma.jobs.update({
    where: { id: job.id },
    data: {
      status: 'QUEUED',
      attempts_made: 0,
      run_at: new Date(),
      worker_id: null,
      updated_at: new Date()
    }
  });

  res.json(updatedJob);
});

jobsRouter.delete('/:id', async (req, res) => {
  await prisma.jobs.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
