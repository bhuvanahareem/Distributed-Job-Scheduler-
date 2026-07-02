import { prisma } from '../lib/prisma.js';
import { jobs } from '@prisma/client';

export async function executeJob(job: jobs, workerId: string) {
  await prisma.job_logs.create({
    data: {
      job_id: job.id,
      log_text: `[Worker ${workerId}] Started execution of job ${job.id}`
    }
  });

  // Simulate work
  const workDuration = Math.floor(Math.random() * 2500) + 500;
  await new Promise(resolve => setTimeout(resolve, workDuration));

  // Simulate failure rate (~20%)
  if (Math.random() < 0.2) {
    throw new Error('Simulated random job execution failure');
  }

  await prisma.job_logs.create({
    data: {
      job_id: job.id,
      log_text: `[Worker ${workerId}] Completed execution in ${workDuration}ms`
    }
  });

  return workDuration;
}
