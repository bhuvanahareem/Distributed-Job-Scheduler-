import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export const projectsRouter = Router();

projectsRouter.get('/', async (req, res) => {
  if (!req.user?.org_id) return res.json([]);
  
  const projects = await prisma.projects.findMany({
    where: { org_id: req.user.org_id },
    orderBy: { created_at: 'desc' }
  });
  res.json(projects);
});

const createSchema = z.object({
  name: z.string().min(1)
});

projectsRouter.post('/', async (req, res) => {
  if (!req.user?.org_id) return res.status(403).json({ message: 'No organization' });
  const data = createSchema.parse(req.body);
  
  const project = await prisma.projects.create({
    data: {
      name: data.name,
      org_id: req.user.org_id
    }
  });
  res.status(201).json(project);
});
