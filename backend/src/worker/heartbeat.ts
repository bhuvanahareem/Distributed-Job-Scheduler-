import { prisma } from '../lib/prisma.js';

export async function updateHeartbeat(workerId: string) {
  try {
    await prisma.workers.update({
      where: { id: workerId },
      data: { last_heartbeat_at: new Date() }
    });
  } catch (err) {
    console.error(`[Worker ${workerId}] Heartbeat failed:`, err);
  }
}
