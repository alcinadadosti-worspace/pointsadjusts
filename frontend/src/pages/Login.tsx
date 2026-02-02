import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { MANAGER_MAP, MANAGER_NAMES } from '../data/managerMap';
import { Loader2, ArrowRight, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager || !pin) return;

    setLoading(true);
    setError('');

    const email = MANAGER_MAP[selectedManager];

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pin,
      });

      if (authError) throw authError;

      // Sucesso
      localStorage.setItem('managerName', selectedManager); // Persistir nome para boas-vindas
      navigate('/dashboard');
    } catch (err: any) {
      setError('Falha na autenticação. Verifique o PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center space-y-2">
          <div className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Acesso Gestor</h1>
          <p className="text-secondary text-sm">Selecione seu usuário e digite o PIN</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-secondary ml-1">Quem é você?</label>
            <div className="relative">
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="w-full bg-surface border border-border text-white text-sm rounded-lg px-3 py-2.5 appearance-none focus:ring-1 focus:ring-white focus:outline-none transition-all"
              >
                <option value="" disabled>Selecione um gestor...</option>
                {MANAGER_NAMES.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-zinc-500 text-[10px]">▼</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-secondary ml-1">PIN de Acesso</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              className="w-full bg-surface border border-border text-white text-sm rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-white focus:outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center bg-red-950/30 py-2 rounded-lg border border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedManager || !pin}
            className="w-full bg-white text-black font-medium py-2.5 rounded-lg text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Entrar no Sistema'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}