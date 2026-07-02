import { useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import { api } from '../lib/api.js';
import { usePolling } from '../hooks/usePolling.js';
import { Toggle } from '../components/Toggle.js';
import { CreateQueueModal } from '../components/CreateQueueModal.js';

export function Queues() {
  const { data: queues, refetch } = usePolling(() => api.get<any[]>('/queues'), 5000);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const togglePause = async (id: string, current: boolean) => {
    try {
      await api.patch(`/queues/${id}/pause`, { is_paused: !current });
      refetch();
    } catch (e) {
      alert('Failed to toggle pause');
    }
  };

  const updateConcurrency = async (id: string, val: string) => {
    try {
      await api.patch(`/queues/${id}`, { concurrency_limit: parseInt(val, 10) });
      setEditingId(null);
      refetch();
    } catch (e) {
      alert('Failed to update limit');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Queue Orchestration</h1>
          <p className="text-muted mt-2">Manage pipelines, pause processing, and adjust concurrency.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-canvas rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Queue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {queues?.map(q => (
          <div key={q.id} className={`relative overflow-hidden rounded-xl border border-border bg-canvas transition-all ${q.is_paused ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-md'}`}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border">
                    <Layers className="w-5 h-5 text-muted" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink">{q.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary-light text-primary">Priority {q.priority}</span>
                      <span className="text-xs text-muted">{q._count?.jobs || 0} jobs</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 py-4 border-y border-border my-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Concurrency Limit</span>
                  {editingId === q.id ? (
                    <input 
                      type="number" 
                      defaultValue={q.concurrency_limit}
                      className="w-16 text-right text-sm border-b border-primary focus:outline-none bg-transparent font-medium"
                      autoFocus
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateConcurrency(q.id, e.currentTarget.value);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                  ) : (
                    <span 
                      className="text-sm font-medium cursor-pointer hover:text-primary transition-colors border-b border-dashed border-muted"
                      onClick={() => setEditingId(q.id)}
                    >
                      {q.concurrency_limit}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Retry Strategy</span>
                  <span className="text-sm font-medium">{q.backoff_strategy}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-ink">{q.is_paused ? 'Paused' : 'Active'}</span>
                <Toggle 
                  checked={!q.is_paused} 
                  onChange={() => togglePause(q.id, q.is_paused)} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <CreateQueueModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={refetch} 
      />
    </div>
  );
}
