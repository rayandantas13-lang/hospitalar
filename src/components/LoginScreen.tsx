import { useState } from 'react';
import { useStore } from '../store';
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginScreen() {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (!login(username, password)) setError('Credenciais inválidas. Verifique usuário e senha.');
      setLoading(false);
    }, 400);
  };

  const quickLogin = (u: string, p: string) => { setUsername(u); setPassword(p); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-[128px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full blur-[128px]" />
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-black text-white">H</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">HealthSys</h1>
              <p className="text-blue-300 text-xs font-medium tracking-wider uppercase">Sistema de Gestão Hospitalar</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Gestão inteligente para<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">sua unidade de saúde</span>
          </h2>
          <p className="text-blue-200/70 text-base leading-relaxed">
            Plataforma completa para gerenciamento de atendimentos, triagem, consultório médico, almoxarifado e emergências. Tudo em um só lugar.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { n: '24h', t: 'Atendimento' },
              { n: '5+', t: 'Módulos' },
              { n: '100%', t: 'Digital' },
            ].map(s => (
              <div key={s.t} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-white">{s.n}</p>
                <p className="text-blue-300 text-xs mt-1">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
              <span className="text-xl font-black text-white">H</span>
            </div>
            <span className="text-xl font-bold text-white">HealthSys</span>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Entrar no sistema</h3>
              <p className="text-slate-500 text-sm mt-1">Informe suas credenciais para acessar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Usuário</label>
                <input type="text" value={username} onChange={e => { setUsername(e.target.value); setError(''); }}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Digite seu usuário" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Senha</label>
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••" />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm border border-red-100 animate-slide-in-up">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Entrar<ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3">Acesso rápido (demo)</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { u: 'admin', p: 'admin123', label: 'Admin', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
                  { u: 'carlos', p: '123456', label: 'Médico', color: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100' },
                  { u: 'maria', p: '123456', label: 'Enfermeira', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
                  { u: 'ana', p: '123456', label: 'Recepção', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
                  { u: 'joao', p: '123456', label: 'Farmácia', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
                ].map(q => (
                  <button key={q.u} onClick={() => quickLogin(q.u, q.p)}
                    className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all ${q.color}`}>
                    {q.label} <span className="text-[10px] opacity-60">({q.u})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-blue-300/40 text-xs mt-6">HealthSys v2.0 © 2026 — Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}
