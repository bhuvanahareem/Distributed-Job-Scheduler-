import { Server, Activity, Clock } from 'lucide-react';
import { api } from '../lib/api.js';
import { usePolling } from '../hooks/usePolling.js';

export function Workers() {
  const { data: workers } = usePolling(() => api.get<any[]>('/workers'), 5000);

  const getRelativeTime = (dateStr: string) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const minsDifference = Math.round((new Date(dateStr).getTime() - Date.now()) / (1000 * 60));
    
    if (Math.abs(minsDifference) < 60) return rtf.format(minsDifference, 'minute');
    if (Math.abs(daysDifference) < 1) return rtf.format(Math.round(minsDifference / 60), 'hour');
    return rtf.format(daysDifference, 'day');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">Cluster Registry</h1>
        <p className="text-muted mt-2">Monitor worker nodes and cluster health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {workers?.map(w => (
          <div key={w.id} className="relative overflow-hidden rounded-xl bg-[#050B1A] text-[#E2E8F0] border border-[#1E293B] font-mono shadow-lg group">
            {/* Subtle scan-line overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0.02),rgba(255,255,255,0))] bg-[length:100%_4px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />
            
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-muted-light" />
                  <span className="font-bold tracking-tight">{w.hostname}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-muted-light">{w.status}</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${w.status === 'ACTIVE' ? 'bg-success shadow-[0_0_8px_rgba(5,150,105,0.8)] animate-pulse' : 'bg-danger shadow-[0_0_8px_rgba(220,38,38,0.8)]'}`} />
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-[#1E293B]">
                  <span className="text-muted-light flex items-center gap-2"><Activity className="w-4 h-4" /> Current Load</span>
                  <span className="font-bold">{w._count?.jobs || 0} jobs</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#1E293B]">
                  <span className="text-muted-light flex items-center gap-2"><Clock className="w-4 h-4" /> Last Heartbeat</span>
                  <span>{getRelativeTime(w.last_heartbeat_at)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-xs">
                  <span className="text-[#475569]">ID: {w.id.split('-')[0]}...</span>
                  <span className="text-[#475569]">Joined: {new Date(w.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {workers?.length === 0 && (
          <div className="col-span-full p-12 text-center text-muted border border-dashed border-border rounded-xl">
            No worker nodes registered. Run <code>npm run start:worker</code> in the backend directory.
          </div>
        )}
      </div>
    </div>
  );
}
