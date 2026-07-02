import { retry_strategy } from '@prisma/client';

export function calculateBackoffDelay(strategy: retry_strategy, baseDelay: number, attemptsMade: number): number {
  switch (strategy) {
    case 'FIXED':
      return baseDelay;
    case 'LINEAR':
      return baseDelay * attemptsMade;
    case 'EXPONENTIAL':
      return baseDelay * Math.pow(2, attemptsMade);
    default:
      return baseDelay;
  }
}

import { prisma } from '../lib/prisma.js';
import { jobs, queues } from '@prisma/client';

export async function handleRetry(job: jobs, queue: queues, workerId: string, errorMessage: string) {
  const attemptsMade = (job.attempts_made || 0) + 1;
  const retryLimit = queue.retry_limit || 3;

  if (attemptsMade >= retryLimit) {
    // DLQ
    await prisma.$transaction([
      prisma.jobs.update({
        where: { id: job.id },
        data: { status: 'FAILED', attempts_made: attemptsMade, updated_at: new Date() }
      }),
      prisma.job_executions.create({
        data: {
          job_id: job.id,
          worker_id: workerId,
          status: 'FAILURE',
          error_message: errorMessage,
          started_at: new Date(Date.now() - 100),
          finished_at: new Date(),
          duration_ms: 100
        }
      })
    ]);
  } else {
    const delay = calculateBackoffDelay(queue.backoff_strategy || 'EXPONENTIAL', queue.backoff_delay_seconds || 5, attemptsMade);
    const runAt = new Date(Date.now() + delay * 1000);

    await prisma.$transaction([
      prisma.jobs.update({
        where: { id: job.id },
        data: { status: 'SCHEDULED', attempts_made: attemptsMade, run_at: runAt, worker_id: null, updated_at: new Date() }
      }),
      prisma.job_executions.create({
        data: {
          job_id: job.id,
          worker_id: workerId,
          status: 'FAILURE',
          error_message: errorMessage,
          started_at: new Date(Date.now() - 100),
          finished_at: new Date(),
          duration_ms: 100
        }
      }),
      prisma.job_logs.create({
        data: {
          job_id: job.id,
          log_text: `[RETRY] Attempt ${attemptsMade} failed. Retrying in ${delay} seconds.`
        }
      })
    ]);
  }
}
