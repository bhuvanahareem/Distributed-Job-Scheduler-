import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { signToken, authMiddleware } from '../middleware/auth.js';

export const authRouter = Router();

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  orgName: z.string().min(2)
});

authRouter.post('/signup', async (req, res) => {
  const data = signupSchema.parse(req.body);
  
  const existingUser = await prisma.users.findUnique({ where: { email: data.email } });
  if (existingUser) throw new AppError('Email already in use', 400);

  const passwordHash = await bcrypt.hash(data.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organizations.create({
      data: { name: data.orgName }
    });
    
    const user = await tx.users.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash: passwordHash,
        org_id: org.id
      }
    });
    
    return { user, org };
  });

  const token = signToken({ id: result.user.id, email: result.user.email, org_id: result.user.org_id });

  res.status(201).json({
    token,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      org_id: result.user.org_id,
      organization: result.org
    }
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

authRouter.post('/login', async (req, res) => {
  const data = loginSchema.parse(req.body);
  
  const user = await prisma.users.findUnique({ 
    where: { email: data.email },
    include: { organization: true }
  });
  
  if (!user) throw new AppError('Invalid credentials', 401);
  
  const valid = await bcrypt.compare(data.password, user.password_hash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = signToken({ id: user.id, email: user.email, org_id: user.org_id });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      org_id: user.org_id,
      organization: user.organization
    }
  });
});

authRouter.get('/me', authMiddleware, async (req, res) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const user = await prisma.users.findUnique({
    where: { id: req.user.id },
    include: { organization: true }
  });
  if (!user) throw new AppError('User not found', 404);
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    org_id: user.org_id,
    organization: user.organization
  });
});
