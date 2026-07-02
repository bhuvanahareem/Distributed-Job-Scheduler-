import { prisma } from '../lib/prisma.js';
import { handleRetry } from './retry.js';
import { executeJob } from './executor.js';
import cronParser from 'cron-parser';

export async function pollAndExecute(workerId: string, shuttingDown: { value: boolean }) {
  if (shuttingDown.value) return;

  try {
    const claimedJobs: any[] = await prisma.$queryRawUnsafe(`
      UPDATE jobs SET status = 'CLAIMED', worker_id = $1::uuid, updated_at = NOW()
      WHERE id = (
          SELECT j.id FROM jobs j
          INNER JOIN queues q ON j.queue_id = q.id
          WHERE j.status IN ('QUEUED', 'SCHEDULED') AND j.run_at <= NOW()
          AND q.is_paused = false
          ORDER BY q.priority DESC, j.created_at ASC
          LIMIT 1 FOR UPDATE OF j SKIP LOCKED
      ) RETURNING *;
    `, workerId);

    if (claimedJobs.length === 0) return;

    const job = claimedJobs[0];
    
    await prisma.jobs.update({
      where: { id: job.id },
      data: { status: 'RUNNING', updated_at: new Date() }
    });

    const queue = await prisma.queues.findUnique({ where: { id: job.queue_id } });
    if (!queue) return;

    const startTime = Date.now();
    try {
      const duration = await executeJob(job, workerId);

      await prisma.$transaction([
        prisma.jobs.update({
          where: { id: job.id },
          data: { status: 'COMPLETED', updated_at: new Date() }
        }),
        prisma.job_executions.create({
          data: {
            job_id: job.id,
            worker_id: workerId,
            status: 'SUCCESS',
            started_at: new Date(startTime),
            finished_at: new Date(),
            duration_ms: duration
          }
        })
      ]);

      if (job.cron_expression) {
        try {
          const interval = cronParser.parseExpression(job.cron_expression);
          await prisma.jobs.create({
            data: {
              queue_id: job.queue_id,
              payload: job.payload,
              status: 'SCHEDULED',
              run_at: interval.next().toDate(),
              cron_expression: job.cron_expression
            }
          });
        } catch (e) {
          console.error('Failed to schedule next cron execution', e);
        }
      }
    } catch (error: any) {
      await handleRetry(job, queue, workerId, error.message || 'Unknown error');
    }
  } catch (error) {
    console.error(`[Worker ${workerId}] Polling error:`, error);
  }
}
