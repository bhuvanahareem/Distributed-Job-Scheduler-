import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const statsRouter = Router();

statsRouter.get('/overview', async (req, res) => {
  const where: any = {};
  if (req.user?.org_id) {
    where.queue = { project: { org_id: req.user.org_id } };
  }

  const counts = await prisma.jobs.groupBy({
    by: ['status'],
    where,
    _count: true
  });

  const stats = {
    QUEUED: 0,
    SCHEDULED: 0,
    CLAIMED: 0,
    RUNNING: 0,
    COMPLETED: 0,
    FAILED: 0,
    total: 0
  };

  counts.forEach(c => {
    if (c.status) {
      stats[c.status] = c._count;
      stats.total += c._count;
    }
  });

  res.json(stats);
});

statsRouter.get('/throughput', async (req, res) => {
  const where: any = {};
  if (req.user?.org_id) {
    where.job = { queue: { project: { org_id: req.user.org_id } } };
  }
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  where.started_at = { gte: twentyFourHoursAgo };

  // For a real production app, you'd use a raw SQL query with date_trunc.
  // Here we'll fetch executions and group in memory since it's just 24h.
  const executions = await prisma.job_executions.findMany({
    where,
    select: { status: true, started_at: true },
    orderBy: { started_at: 'asc' }
  });

  const hourMap: Record<string, { completed: number, failed: number }> = {};
  
  // Initialize last 24h
  for (let i = 23; i >= 0; i--) {
    const d = new Date();
    d.setHours(d.getHours() - i, 0, 0, 0);
    hourMap[d.toISOString()] = { completed: 0, failed: 0 };
  }

  executions.forEach(ex => {
    const d = new Date(ex.started_at);
    d.setMinutes(0, 0, 0);
    const key = d.toISOString();
    if (hourMap[key]) {
      if (ex.status === 'SUCCESS') hourMap[key].completed++;
      if (ex.status === 'FAILURE') hourMap[key].failed++;
    }
  });

  const result = Object.entries(hourMap).map(([hour, counts]) => ({ hour, ...counts }));
  res.json(result);
});
