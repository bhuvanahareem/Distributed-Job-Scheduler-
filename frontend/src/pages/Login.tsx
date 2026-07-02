import { useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../App.js';
import { useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      if (isLogin) {
        const res = await api.post<{token: string, user: any}>('/auth/login', data);
        login(res.token, res.user);
        navigate('/dashboard');
      } else {
        const res = await api.post<{token: string, user: any}>('/auth/signup', data);
        login(res.token, res.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-canvas relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-dot-grid opacity-30" />
      
      {/* Decorative large background text */}
      <div className="absolute -left-20 top-20 text-[20rem] font-bold text-muted opacity-[0.02] pointer-events-none tracking-tighter leading-none select-none">
        NEXUS
      </div>

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-32 relative z-10 w-full lg:w-1/2">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary text-canvas flex items-center justify-center shadow-lg">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-ink leading-none">NEXUS</h1>
                <p className="text-xs uppercase font-bold text-muted tracking-widest mt-1">Platform</p>
              </div>
            </div>
            
            <h2 className="mt-6 text-3xl font-extrabold text-ink tracking-tight">
              {isLogin ? 'Sign in to console' : 'Create an account'}
            </h2>
          </div>

          <div className="mt-8">
            <div className="bg-surface border border-border py-8 px-4 shadow-sm rounded-2xl sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-ink">Full Name</label>
                      <input name="name" type="text" required className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-canvas" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink">Organization Name</label>
                      <input name="orgName" type="text" required className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-canvas" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-ink">Email address</label>
                  <input name="email" type="email" required className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-canvas" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink">Password</label>
                  <input name="password" type="password" required className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-canvas" />
                </div>

                {error && (
                  <div className="text-sm text-danger bg-danger-light p-3 rounded-lg border border-danger/20">
                    {error}
                  </div>
                )}

                <div>
                  <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-canvas bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                    {isLogin ? 'Sign in' : 'Sign up'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-muted hover:text-primary transition-colors">
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium visual right side */}
      <div className="hidden lg:block relative w-0 flex-1 bg-[#050B1A]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#004FE2]/20 to-transparent mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDIwaDQwTTIwIDB2NDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 bg-primary rounded-full filter blur-[120px] opacity-40 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
