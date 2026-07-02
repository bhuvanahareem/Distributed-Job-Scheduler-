import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { usePolling } from '../hooks/usePolling.js';
import { api } from '../lib/api.js';
import { MetricCard } from '../components/MetricCard.js';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { data: stats } = usePolling(() => api.get<any>('/stats/overview'), 5000);
  const { data: throughput } = usePolling(() => api.get<any[]>('/stats/throughput'), 10000);

  const formattedThroughput = throughput?.map(t => ({
    time: new Date(t.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    completed: t.completed,
    failed: t.failed
  })) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">System Health</h1>
        <p className="text-muted mt-2">Real-time overview of job processing cluster.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Queued" 
          value={stats?.QUEUED || 0} 
          icon={Clock} 
        />
        <MetricCard 
          title="Running" 
          value={stats?.RUNNING || 0} 
          icon={Loader2} 
          color="primary"
          isActive={(stats?.RUNNING || 0) > 0}
        />
        <MetricCard 
          title="Completed" 
          value={stats?.COMPLETED || 0} 
          icon={CheckCircle2} 
          color="success"
        />
        <MetricCard 
          title="Dead Letter Queue" 
          value={stats?.FAILED || 0} 
          icon={XCircle} 
          color="danger"
        />
      </div>

      <div className="bg-canvas border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-ink mb-6">Processing Throughput (Last 24 Hours)</h3>
        <div className="h-80 w-full">
          {formattedThroughput.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedThroughput} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: 'var(--color-muted)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-muted)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-ink)', color: '#fff', borderRadius: '8px', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="completed" name="Completed" stackId="1" stroke="var(--color-success)" fill="url(#colorCompleted)" />
                <Area type="monotone" dataKey="failed" name="Failed" stackId="2" stroke="var(--color-danger)" fill="url(#colorFailed)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted">
              Loading data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
