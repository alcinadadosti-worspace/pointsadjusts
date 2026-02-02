import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GESTORES_COLABORADORES } from '../data/gestoresColaboradores';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, LogOut, Clock, CalendarDays, Download } from 'lucide-react';
import AdjustmentForm from '../components/AdjustmentForm';
import { REASON_LABELS } from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [managerName, setManagerName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkSession();
    
    // Atalho de teclado para Novo Ajuste (Ctrl+K ou CMD+K idealmente, aqui simplificado para Enter se focado ou botão)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
      return;
    }
    
    const storedName = localStorage.getItem('managerName');
    if (!storedName) {
      navigate('/'); 
      return;
    }

    setManagerName(storedName);
    setUserEmail(session.user.email!);
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    // Buscar Employees
    const { data: empData } = await supabase
      .from('employees')
      .select('*')
      .order('name');
    
    if (empData) setEmployees(empData);

    // Buscar Adjustments (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: adjData } = await supabase
      .from('adjustments')
      .select(`
        *,
        employees (name)
      `)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (adjData) setAdjustments(adjData);
    setLoading(false);
  };

  const handleImportEmployees = async () => {
    if (!managerName) return;
    
    const list = GESTORES_COLABORADORES[managerName];
    if (!list || list.length === 0) {
      alert("Nenhum colaborador encontrado no arquivo local para este gestor.");
      return;
    }

    const payload = list.map(p => ({
      name: p.name,
      user_id: p.user_id || null,
      manager_name: managerName,
      manager_email: userEmail
    }));

    const { error } = await supabase.from('employees').insert(payload);
    
    if (error) {
      console.error(error);
      alert("Erro ao importar.");
    } else {
      fetchData(); // Recarrega a lista
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const filteredAdjustments = adjustments.filter(adj => 
    adj.employees?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background text-zinc-100 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-border bg-surface/30 flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="font-bold text-sm tracking-wide text-zinc-400 uppercase mb-4">Painel de Ponto</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-xs font-bold border border-zinc-600">
              {managerName.substring(0,2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{managerName}</p>
              <p className="text-xs text-secondary truncate">Gestor</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar ajustes..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-white focus:outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 px-2">Estatísticas</div>
            <div className="flex items-center justify-between px-2 py-2 text-sm text-zinc-300 hover:bg-white/5 rounded-md cursor-default">
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Colaboradores</span>
              <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-zinc-400">{employees.length}</span>
            </div>
            <div className="flex items-center justify-between px-2 py-2 text-sm text-zinc-300 hover:bg-white/5 rounded-md cursor-default">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Ajustes (30d)</span>
              <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-zinc-400">{adjustments.length}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-secondary hover:text-white transition-colors w-full px-2 py-2">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm z-10">
          <h2 className="text-lg font-semibold">Histórico de Ajustes</h2>
          
          <div className="flex gap-3">
             {employees.length === 0 && !loading && (
              <button 
                onClick={handleImportEmployees}
                className="bg-zinc-800 text-white border border-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Importar meus colaboradores
              </button>
            )}

            <button 
              onClick={() => setShowModal(true)}
              disabled={employees.length === 0}
              className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Novo Ajuste
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-secondary">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando...
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-secondary space-y-4">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center border border-border">
                <Users className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-center max-w-md">
                Você ainda não tem colaboradores vinculados.<br/>Clique no botão "Importar" acima para carregar sua equipe.
              </p>
            </div>
          ) : filteredAdjustments.length === 0 ? (
            <div className="text-center text-zinc-500 mt-20">Nenhum ajuste encontrado.</div>
          ) : (
            <div className="grid gap-4">
              {filteredAdjustments.map((adj) => (
                <div key={adj.id} className="group bg-surface border border-border rounded-xl p-4 hover:border-zinc-600 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-border flex items-center justify-center text-xs font-bold text-zinc-400">
                        {adj.employees?.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-zinc-100">{adj.employees?.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(adj.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider border border-zinc-700 bg-zinc-800/50 px-2 py-1 rounded text-zinc-400">
                      {REASON_LABELS[adj.reason] || adj.reason}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-center text-sm bg-black/20 rounded-lg p-2 mb-3">
                    <div>
                      <span className="block text-[10px] text-zinc-600 uppercase">Entrada</span>
                      <span className="font-mono text-zinc-300">{adj.entry_time.slice(0,5)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-600 uppercase">Saída Int.</span>
                      <span className="font-mono text-zinc-500">{adj.break_out_time?.slice(0,5) || '--:--'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-600 uppercase">Volta Int.</span>
                      <span className="font-mono text-zinc-500">{adj.break_in_time?.slice(0,5) || '--:--'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-600 uppercase">Saída</span>
                      <span className="font-mono text-zinc-300">{adj.exit_time.slice(0,5)}</span>
                    </div>
                  </div>

                  {adj.note && (
                    <p className="text-xs text-zinc-500 italic border-l-2 border-zinc-700 pl-2">
                      "{adj.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL / SLIDE OVER */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/60 backdrop-blur-sm p-4 sm:p-0">
          <div 
            className="bg-[#121212] w-full max-w-lg h-full sm:h-[95%] sm:mr-4 sm:rounded-2xl border border-border shadow-2xl overflow-hidden animate-in slide-in-from-right-10 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <AdjustmentForm 
              onClose={() => setShowModal(false)} 
              onSuccess={() => { setShowModal(false); fetchData(); }}
              managerEmail={userEmail}
              managerName={managerName}
              employees={employees}
            />
          </div>
        </div>
      )}
    </div>
  );
}