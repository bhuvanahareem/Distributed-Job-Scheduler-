import { X, RefreshCw, Loader2 } from 'lucide-react'; 
import { StatusBadge } from './StatusBadge.js';
import { TerminalBlock } from './TerminalBlock.js';
import { api } from '../lib/api.js';

interface Props {
  job: any | null;
  isOpen: boolean;
  onClose: () => void;
  onRetried: () => void;
}

export function JobDrawer({ job, isOpen, onClose, onRetried }: Props) {
  if (!isOpen) return null;

  const handleRetry = async () => {
    if (!job) return;
    try {
      await api.post(`/jobs/${job.id}/retry`);
      onRetried();
    } catch (e) {
      alert('Failed to retry job');
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-canvas border-l border-border z-50 flex flex-col transition-transform transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Job Details</h2>
            <p className="text-sm font-mono text-muted mt-1">{job?.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {job ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
              <StatusBadge status={job.status} />
              {job.status === 'FAILED' && (
                <button 
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-canvas rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Job
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-surface border border-border">
                <p className="text-xs font-medium text-muted mb-1">Queue</p>
                <p className="font-medium">{job.queue?.name || 'Unknown'}</p>
              </div>
              <div className="p-4 rounded-lg bg-surface border border-border">
                <p className="text-xs font-medium text-muted mb-1">Attempts</p>
                <p className="font-medium">{job.attempts_made || 0}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">Payload</h3>
              <TerminalBlock content={JSON.stringify(job.payload, null, 2)} />
            </div>

            {job.job_executions && job.job_executions.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">Execution History</h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {job.job_executions.map((exec: any) => (
                    <div key={exec.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-canvas bg-surface text-muted shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                        <div className={`w-2 h-2 rounded-full ${exec.status === 'SUCCESS' ? 'bg-success' : 'bg-danger'}`}></div>
                      </div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-lg border border-border bg-canvas shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-medium text-sm ${exec.status === 'SUCCESS' ? 'text-success' : 'text-danger'}`}>{exec.status}</span>
                          <time className="text-xs text-muted font-mono">{new Date(exec.started_at).toLocaleString()}</time>
                        </div>
                        <p className="text-sm text-muted">Duration: {exec.duration_ms}ms</p>
                        {exec.error_message && (
                          <div className="mt-2 text-xs font-mono text-danger-light bg-danger/10 p-2 rounded">
                            {exec.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {job.job_logs && job.job_logs.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">Logs</h3>
                <TerminalBlock content={job.job_logs.map((l: any) => `[${new Date(l.created_at).toISOString()}] ${l.log_text}`).join('\n')} />
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 flex items-center justify-center h-full text-muted">
            <Loader2 className="w-8 h-8 animate-spin opacity-50" />
          </div>
        )}
      </div>
    </>
  );
}
