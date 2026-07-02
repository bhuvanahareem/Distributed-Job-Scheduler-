import 'dotenv/config';
import os from 'os';
import { prisma } from '../lib/prisma.js';
import { pollAndExecute } from './poller.js';
import { updateHeartbeat } from './heartbeat.js';
import { detectZombies } from './zombie.js';

async function startWorker() {
  const hostname = os.hostname();
  
  const worker = await prisma.workers.create({
    data: {
      hostname,
      status: 'ACTIVE',
      last_heartbeat_at: new Date()
    }
  });

  const workerId = worker.id;
  console.log(`[Worker] Started worker ${workerId} on ${hostname}`);

  const shuttingDown = { value: false };
  const POLL_INTERVAL = parseInt(process.env.WORKER_POLL_INTERVAL_MS || '2000', 10);

  // Job Polling Loop
  setInterval(() => {
    pollAndExecute(workerId, shuttingDown);
  }, POLL_INTERVAL);

  // Heartbeat Loop
  setInterval(() => {
    if (!shuttingDown.value) updateHeartbeat(workerId);
  }, 10000);

  // Zombie Supervisor Loop
  setInterval(() => {
    if (!shuttingDown.value) detectZombies();
  }, 15000);

  // Graceful Shutdown
  const shutdown = async () => {
    console.log(`\n[Worker] Shutting down worker ${workerId}...`);
    shuttingDown.value = true;
    
    try {
      await prisma.workers.update({
        where: { id: workerId },
        data: { status: 'DEAD' }
      });
      await prisma.$disconnect();
    } catch (err) {
      console.error('[Worker] Shutdown error:', err);
    }
    
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startWorker().catch(console.error);
