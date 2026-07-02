import { CheckCircle2, XCircle, Clock, Loader2, Zap } from 'lucide-react';

interface Props {
  status: string;
}

export function StatusBadge({ status }: Props) {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border border-transparent";
  
  switch (status) {
    case 'QUEUED':
      return (
        <span className={`${base} bg-surface border-border text-muted`}>
          <Clock className="w-3.5 h-3.5" />
          QUEUED
        </span>
      );
    case 'SCHEDULED':
      return (
        <span className={`${base} bg-[var(--color-scheduled-light)] text-[var(--color-scheduled)]`}>
          <Clock className="w-3.5 h-3.5" />
          SCHEDULED
        </span>
      );
    case 'CLAIMED':
      return (
        <span className={`${base} bg-surface border-primary text-primary`}>
          <Zap className="w-3.5 h-3.5" />
          CLAIMED
        </span>
      );
    case 'RUNNING':
      return (
        <span className={`${base} bg-primary text-canvas`}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="flex items-center gap-1.5">
            RUNNING
            <span className="w-1.5 h-1.5 rounded-full bg-canvas animate-pulse-dot" />
          </span>
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`${base} bg-success-light text-success`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          COMPLETED
        </span>
      );
    case 'FAILED':
      return (
        <span className={`${base} bg-danger-light text-danger`}>
          <XCircle className="w-3.5 h-3.5" />
          FAILED
        </span>
      );
    default:
      return (
        <span className={`${base} bg-surface text-muted`}>
          {status}
        </span>
      );
  }
}
