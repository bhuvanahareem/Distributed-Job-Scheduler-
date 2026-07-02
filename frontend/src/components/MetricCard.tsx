import type { LucideIcon } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface Props {
  title: string;
  value: number | string;
  icon: LucideIcon;
  sparklineData?: { value: number }[];
  color?: 'primary' | 'success' | 'danger' | 'neutral';
  isActive?: boolean;
}

export function MetricCard({ title, value, icon: Icon, sparklineData, color = 'neutral', isActive = false }: Props) {
  const getColors = () => {
    switch (color) {
      case 'primary': return { bg: 'bg-primary-light', text: 'text-primary', chart: 'var(--color-primary)' };
      case 'success': return { bg: 'bg-success-light', text: 'text-success', chart: 'var(--color-success)' };
      case 'danger': return { bg: 'bg-danger-light', text: 'text-danger', chart: 'var(--color-danger)' };
      default: return { bg: 'bg-surface', text: 'text-muted', chart: 'var(--color-muted)' };
    }
  };
  
  const c = getColors();

  return (
    <div className={`relative overflow-hidden rounded-xl border ${isActive ? 'border-primary shadow-sm' : 'border-border'} bg-canvas p-6 transition-all hover:shadow-md group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-ink tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${c.bg} ${c.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {sparklineData && sparklineData.length > 0 && (
        <div className="h-16 mt-4 -mx-2 -mb-4 opacity-60 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c.chart} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={c.chart} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={c.chart} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${color})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
