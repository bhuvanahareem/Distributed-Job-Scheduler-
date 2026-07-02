import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { DataTable } from '../components/DataTable.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { JobDrawer } from '../components/JobDrawer.js';
import { CreateJobModal } from '../components/CreateJobModal.js';
import { Plus, Search } from 'lucide-react';

export function Jobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [queueId, setQueueId] = useState('');
  
  const [queues, setQueues] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchJobs = async () => {
    try {
      const q = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (status) q.append('status', status);
      if (queueId) q.append('queue_id', queueId);
      
      const res = await api.get<any>(`/jobs?${q.toString()}`);
      setJobs(res.data);
      setTotal(res.pagination.total);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    api.get<any[]>('/queues').then(setQueues).catch(console.error);
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [page, status, queueId]);

  useEffect(() => {
    if (selectedJobId) {
      api.get<any>(`/jobs/${selectedJobId}`).then(setJobDetails).catch(console.error);
    } else {
      setJobDetails(null);
    }
  }, [selectedJobId]);

  const columns = [
    { key: 'id', label: 'Job ID', render: (r: any) => <span className="font-mono text-xs">{r.id.split('-')[0]}...</span> },
    { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
    { key: 'queue', label: 'Queue', render: (r: any) => <span className="font-medium">{r.queue?.name || 'Unknown'}</span> },
    { key: 'type', label: 'Type', render: (r: any) => (
      <span className="text-muted">{r.cron_expression ? 'Cron' : (r.run_at > r.created_at ? 'Delayed' : 'Immediate')}</span>
    )},
    { key: 'created_at', label: 'Created', render: (r: any) => <span className="text-muted">{new Date(r.created_at).toLocaleString()}</span> },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Job Explorer</h1>
          <p className="text-muted mt-2">Granular view of all queued, running, and historical jobs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-canvas rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </button>
      </div>

      <div className="flex gap-4 items-center bg-surface p-4 rounded-xl border border-border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search by ID or Payload..." 
            className="w-full pl-9 pr-4 py-2 bg-canvas border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            disabled
          />
        </div>
        <select 
          value={status} 
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-canvas border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
        >
          <option value="">All Statuses</option>
          {['QUEUED', 'SCHEDULED', 'CLAIMED', 'RUNNING', 'COMPLETED', 'FAILED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select 
          value={queueId} 
          onChange={(e) => { setQueueId(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-canvas border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
        >
          <option value="">All Queues</option>
          {queues.map(q => (
            <option key={q.id} value={q.id}>{q.name}</option>
          ))}
        </select>
      </div>

      <DataTable 
        columns={columns} 
        data={jobs} 
        onRowClick={(row) => setSelectedJobId(row.id)}
        pagination={{
          page,
          totalPages: Math.ceil(total / 20) || 1,
          onPageChange: setPage
        }}
      />

      <JobDrawer 
        job={jobDetails} 
        isOpen={!!selectedJobId} 
        onClose={() => setSelectedJobId(null)} 
        onRetried={() => {
          fetchJobs();
          setSelectedJobId(null);
        }}
      />
      <CreateJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={fetchJobs} 
        queues={queues}
      />
    </div>
  );
}
