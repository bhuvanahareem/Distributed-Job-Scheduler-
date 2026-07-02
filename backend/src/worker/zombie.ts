import { prisma } from '../lib/prisma.js';

export async function detectZombies() {
  const thirtySecondsAgo = new Date(Date.now() - 30000);
  
  const zombies = await prisma.workers.findMany({
    where: {
      last_heartbeat_at: { lt: thirtySecondsAgo },
      status: 'ACTIVE'
    }
  });

  for (const zombie of zombies) {
    console.log(`[Zombie Supervisor] Worker ${zombie.hostname} (${zombie.id}) is DEAD. Reclaiming jobs...`);
    
    await prisma.$transaction([
      prisma.workers.update({
        where: { id: zombie.id },
        data: { status: 'DEAD' }
      }),
      prisma.jobs.updateMany({
        where: { worker_id: zombie.id, status: { in: ['CLAIMED', 'RUNNING'] } },
        data: { status: 'QUEUED', worker_id: null, updated_at: new Date() }
      })
    ]);
  }
}
