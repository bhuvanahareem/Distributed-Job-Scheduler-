# Nexus Job Scheduling Platform

A production-grade distributed job scheduling platform built as a full-stack monorepo.

## Architecture Highlights
- **Backend**: Express 5.x, Prisma 6.x, PostgreSQL (Supabase)
- **Worker Cluster**: Standalone Node.js process using raw SQL `FOR UPDATE SKIP LOCKED` for atomic lock allocation across multiple nodes.
- **Frontend Dashboard**: React + Vite + Tailwind CSS v4, featuring a premium dark-mode aesthetic with real-time Recharts visualizations and Lucide icons.
- **Monorepo Structure**: Shared root package.json for cross-workspace scripts.

## Quick Start

### 1. Environment Setup
Create a `.env` file in the `backend` directory based on `.env.example`:
```
DATABASE_URL=postgresql://your-supabase-db-url
PORT=4000
JWT_SECRET=super_secret_string
ALLOWED_ORIGINS=*
WORKER_POLL_INTERVAL_MS=2000
```

*(Note: The database schema has already been provisioned on Supabase. We do not run Prisma migrations here.)*

### 2. Install Dependencies
Run from the repository root:
```bash
npm run install:all
```

### 3. Run the Platform
You need three separate terminal windows to run the full platform concurrently.

**Terminal 1: API Server**
```bash
npm run start:api
```

**Terminal 2: Worker Process (Cluster Node)**
```bash
npm run start:worker
```
*(You can spin up multiple worker terminals to simulate a distributed cluster!)*

**Terminal 3: Frontend Dashboard**
```bash
npm run dev:frontend
```

Open `http://localhost:5173` to access the Nexus Developer Console.

## Features
- **Job Ingestion Engine**: Immediate, Delayed, and Recurring (Cron) jobs.
- **Concurrency & Backoff**: Configure queue-level concurrency limits and mathematical backoff strategies (Fixed, Linear, Exponential).
- **Dead Letter Queue (DLQ)**: Jobs failing beyond the retry limit are permanently failed and archived.
- **Zombie Supervisor**: Workers send periodic heartbeats. If a worker node crashes, the supervisor detects the "zombie" within 30 seconds and safely returns inflight jobs to the queue.
- **JWT Authentication**: Full organization, project, and user isolation.
