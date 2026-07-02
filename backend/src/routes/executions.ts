import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { paginate, paginatedResponse } from '../lib/pagination.js';
import { execution_status } from '@prisma/client';

export const executionsRouter = Router();

executionsRouter.get('/', async (req, res) => {
  const { job_id, status, page, pageSize } = req.query;
  const { skip, take, page: p, pageSize: ps } = paginate(page as string, pageSize as string);
  
  const where: any = {};
  if (job_id) where.job_id = job_id;
  if (status) where.status = status as execution_status;

  if (req.user?.org_id) {
    where.job = { queue: { project: { org_id: req.user.org_id } } };
  }

  const [total, executions] = await Promise.all([
    prisma.job_executions.count({ where }),
    prisma.job_executions.findMany({
      where,
      skip,
      take,
      orderBy: { started_at: 'desc' },
      include: { job: { select: { payload: true, queue: { select: { name: true } } } } }
    })
  ]);

  res.json(paginatedResponse(executions, total, p, ps));
});

executionsRouter.get('/job/:jobId', async (req, res) => {
  const executions = await prisma.job_executions.findMany({
    where: { job_id: req.params.jobId },
    orderBy: { started_at: 'desc' }
  });
  res.json(executions);
});
