import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Layers, Briefcase, Server, LogOut, CheckSquare } from 'lucide-react';
import { useAuth } from '../App.js';

export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { path: '/queues', label: 'Queues', icon: Layers },
        { path: '/jobs', label: 'Job Explorer', icon: Briefcase }
      ]
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        { path: '/workers', label: 'Cluster Registry', icon: Server }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-canvas flex text-ink">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-canvas flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight leading-none text-ink">NEXUS</h1>
              <p className="text-[10px] uppercase font-bold text-muted tracking-widest mt-0.5">Job Scheduler</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-bold text-muted tracking-wider mb-3 px-2">
                {group.title}
              </h2>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
                        active 
                          ? 'bg-primary-light text-primary' 
                          : 'text-muted hover:bg-border-light hover:text-ink'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
              <p className="text-xs text-muted truncate">{user?.organization?.name}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors shrink-0"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col bg-canvas relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
        <div className="flex-1 overflow-y-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
