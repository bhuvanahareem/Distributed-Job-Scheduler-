import { X } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateQueueModal({ isOpen, onClose, onCreated }: Props) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      // Ensure we have a project to associate this queue with
      let projects = await api.get<any[]>('/projects');
      let projectId = projects[0]?.id;
      
      if (!projectId) {
        const newProject = await api.post<any>('/projects', { name: 'Default Project' });
        projectId = newProject.id;
      }

      await api.post('/queues', {
        name: data.name,
        project_id: projectId,
        priority: parseInt(data.priority as string, 10),
        concurrency_limit: parseInt(data.concurrency as string, 10),
        retry_limit: parseInt(data.retries as string, 10),
        backoff_strategy: data.strategy
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create queue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-canvas border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
          <h2 className="text-xl font-bold tracking-tight">Create Queue</h2>
          <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Queue Name</label>
            <input name="name" type="text" required placeholder="e.g. image-processing" className="w-full border border-border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary bg-canvas text-sm" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Priority</label>
              <input name="priority" type="number" defaultValue={1} min={1} required className="w-full border border-border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary bg-canvas text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Concurrency Limit</label>
              <input name="concurrency" type="number" defaultValue={5} min={1} required className="w-full border border-border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary bg-canvas text-sm" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Retry Limit</label>
              <input name="retries" type="number" defaultValue={3} min={0} required className="w-full border border-border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary bg-canvas text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Backoff Strategy</label>
              <select name="strategy" defaultValue="EXPONENTIAL" className="w-full border border-border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary bg-canvas text-sm">
                <option value="FIXED">Fixed</option>
                <option value="LINEAR">Linear</option>
                <option value="EXPONENTIAL">Exponential</option>
              </select>
            </div>
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
              {loading ? 'Creating...' : 'Create Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
