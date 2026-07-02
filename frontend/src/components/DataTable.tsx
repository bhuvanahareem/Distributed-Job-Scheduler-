import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
  };
}

export function DataTable<T extends { id?: string }>({ columns, data, onRowClick, emptyMessage = 'No data available', pagination }: Props<T>) {
  return (
    <div className="bg-canvas border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface border-b border-border text-muted font-medium">
            <tr>
              {columns.map(c => (
                <th key={c.key} className="px-6 py-4">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr 
                  key={row.id || i} 
                  onClick={() => onRowClick?.(row)}
                  className={`group ${onRowClick ? 'cursor-pointer hover:bg-surface transition-colors' : ''}`}
                >
                  {columns.map(c => (
                    <td key={c.key} className="px-6 py-4 text-ink">
                      {c.render ? c.render(row) : (row as any)[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface/50">
          <span className="text-sm text-muted">
            Page <span className="font-medium text-ink">{pagination.page}</span> of <span className="font-medium text-ink">{pagination.totalPages}</span>
          </span>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); pagination.onPageChange(pagination.page - 1); }}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-md border border-border bg-canvas text-ink hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); pagination.onPageChange(pagination.page + 1); }}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-md border border-border bg-canvas text-ink hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
