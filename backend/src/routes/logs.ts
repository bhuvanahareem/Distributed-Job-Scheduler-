import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { paginate, paginatedResponse } from '../lib/pagination.js';

export const logsRouter = Router();

logsRouter.get('/job/:jobId', async (req, res) => {
  const { page, pageSize } = req.query;
  const { skip, take, page: p, pageSize: ps } = paginate(page as string, pageSize as string);
  
  const where = { job_id: req.params.jobId };

  const [total, logs] = await Promise.all([
    prisma.job_logs.count({ where }),
    prisma.job_logs.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' }
    })
  ]);

  res.json(paginatedResponse(logs, total, p, ps));
});
