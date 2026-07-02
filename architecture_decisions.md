# Architecture Decisions

This document outlines the core technical trade-offs and structural scaling behaviors implemented in the Nexus Job Scheduling Platform.

## 1. Concurrency via `FOR UPDATE SKIP LOCKED`
### Decision
We chose PostgreSQL's row-level locking via `SELECT ... FOR UPDATE SKIP LOCKED` instead of a Redis-based queue (like BullMQ).
### Rationale
- **Simplicity**: No need for a separate Redis cluster infrastructure.
- **ACID Compliance**: Complete transactional integrity between job states and application data.
- **Atomic Allocation**: `SKIP LOCKED` ensures that if Worker A locks Row 1, Worker B instantly skips Row 1 and grabs Row 2. This completely eliminates double-claiming race conditions across distributed worker nodes.

## 2. Exponential Backoff Engine
### Decision
Mathematical backoff calculations (`delay = base * 2^attempts`) are computed directly by the worker node upon job failure rather than relying on complex database triggers.
### Rationale
- Offloads CPU calculation overhead from the database layer.
- Makes it trivial to implement diverse strategies (`FIXED`, `LINEAR`, `EXPONENTIAL`) in TypeScript.
- Automatically transitions jobs to a Dead Letter Queue (`FAILED` status) when `attempts_made` exceeds the queue's `retry_limit`.

## 3. Zombie Worker Supervisor
### Decision
Workers ping a `last_heartbeat_at` timestamp every 10 seconds. A supervisor loop runs every 15 seconds to detect missing heartbeats (>30 seconds old).
### Rationale
- Protects against SIGKILLs, hardware failures, or network partitions.
- Prevents jobs from getting permanently stuck in the `CLAIMED` or `RUNNING` state if the node executing them vanishes.

## 4. Framework Choices
- **Express 5.x**: Chosen for its native asynchronous error handling. Uncaught promise rejections automatically flow to the global error middleware without needing `asyncHandler` wrappers, creating much cleaner routing code.
- **Prisma ORM**: Standardized type-safe data access, though `$queryRawUnsafe` is explicitly used for the highly customized queue polling query.
- **Tailwind CSS v4**: Utilizes the modern CSS-first configuration to drastically simplify design token management while providing a premium, custom aesthetic entirely divorced from generic UI library looks.
