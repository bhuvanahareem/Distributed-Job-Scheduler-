import { X } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  queues: any[];
}

export function CreateJobModal({ isOpen, onClose, onCreated, queues }: Props) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('immediate');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    let payloadParsed = {};
    try {
      payloadParsed = JSON.parse((data.payload as string) || '{}');
    } catch {
      setError('Invalid JSON in payload');
      setLoading(false);
      return;
    }

    try {
      await api.post('/jobs', {
        queue_id: data.queue_id,
        payload: payloadParsed,
        type: data.type,
        ...(data.type === 'delayed' && data.run_at ? { run_at: new Date(data.run_at as string).toISOString() } : {}),
        ...(data.type === 'cron' && data.cron_expression ? { cron_expression: data.cron_expression } : {})
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-canvas border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
          <h2 className="text-xl font-bold tracking-tight">Create Job</h2>
          <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Queue</label>
            <select name="queue_id" required className="w-full border border-border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary bg-canvas text-sm">
              <option value="">Select a queue...</option>
              {queues.map(q => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Execution Type</label>
            <select name="type" value={type} onChange={e => setType(e.target.value)} className="w-full border border-border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary bg-canvas text-sm">
              <option value="immediate">Immediate</option>
              <option value="delayed">Delayed (Scheduled)</option>
              <option value="cron">Recurring (Cron)</option>
            </select>
          </div>

          {type === 'delayed' && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Run At (Local Time)</label>
              <input name="run_at" type="datetime-local" required className="w-full border border-border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary bg-canvas text-sm" />
            </div>
          )}

          {type === 'cron' && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Cron Expression</label>
              <input name="cron_expression" type="text" placeholder="* * * * *" required className="w-full border border-border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary bg-canvas text-sm font-mono" />
              <p className="text-xs text-muted mt-1">e.g., */5 * * * * for every 5 minutes</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Payload (JSON)</label>
            <textarea name="payload" rows={4} defaultValue="{}" required className="w-full border border-border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary bg-canvas text-sm font-mono" />
          </div>

          {error && (
            <div className="text-sm text-danger bg-danger-light p-3 rounded-lg border border-danger/20">
              {error}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted hover:text-ink transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-canvas rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
