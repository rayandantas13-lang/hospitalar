import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Monitor, Volume2, Clock, ExternalLink } from 'lucide-react';

function PainelFullscreen() {
  const { callQueue } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeCall, setActiveCall] = useState<number>(0);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (callQueue.length > 0) {
      setActiveCall(0);
      const t = setInterval(() => setActiveCall(prev => (prev + 1) % Math.min(callQueue.length, 5)), 6000);
      return () => clearInterval(t);
    }
  }, [callQueue.length]);

  const latest = callQueue[activeCall];
  const recent = callQueue.slice(0, 8);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 z-[200] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-black/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <span className="text-lg font-black text-white">H</span>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">HealthSys</h1>
            <p className="text-blue-300 text-xs">Painel de Chamadas</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-5xl font-bold text-white font-mono tracking-wider">
            {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-blue-300 text-sm mt-1">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-8">
        {/* Current Call - Big */}
        <div className="flex-1 flex items-center justify-center">
          {latest ? (
            <div className="text-center animate-slide-in-up" key={latest.id}>
              <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
                <Volume2 className="w-5 h-5 text-blue-400 animate-pulse" />
                <span className="text-blue-300 text-sm font-semibold uppercase tracking-wider">Chamando agora</span>
              </div>
              <h2 className="text-7xl font-black text-white mb-6 leading-tight tracking-tight">{latest.patientName}</h2>
              <div className="flex items-center justify-center gap-8 text-lg">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/10">
                  <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Setor</p>
                  <p className="text-white text-xl font-bold">{latest.sector}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/10">
                  <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Sala / Guichê</p>
                  <p className="text-white text-xl font-bold">{latest.room}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Monitor className="w-20 h-20 text-slate-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-500">Aguardando chamadas</h2>
              <p className="text-slate-600 mt-2">Os pacientes serão exibidos aqui</p>
            </div>
          )}
        </div>

        {/* Recent Calls - Side */}
        <div className="w-80 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-white/10">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Chamadas Recentes
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {recent.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-12">Nenhuma chamada</p>
            ) : (
              recent.map((call, i) => (
                <div key={call.id} className={`px-5 py-4 transition-all ${i === activeCall ? 'bg-blue-500/10' : ''}`}>
                  <p className={`font-bold text-sm ${i === activeCall ? 'text-blue-300' : 'text-white/80'}`}>{call.patientName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-slate-400">{call.sector} • {call.room}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{new Date(call.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-3 bg-black/20 flex items-center justify-between">
        <p className="text-slate-500 text-xs">UPA 24 Horas — Sistema de Chamadas</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-slate-500 text-xs">Online</span>
        </div>
      </div>
    </div>
  );
}

export default function PainelChamada() {
  const { callQueue, removeCall } = useStore();
  const [fullscreen, setFullscreen] = useState(false);

  if (fullscreen) return (
    <div>
      <PainelFullscreen />
      <button onClick={() => setFullscreen(false)}
        className="fixed top-4 right-4 z-[201] bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/20 transition border border-white/20">
        ✕ Fechar Painel
      </button>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center"><Monitor className="w-5 h-5 text-violet-600" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Painel de Chamada</h1>
            <p className="text-xs text-slate-500">Gerencie e visualize as chamadas de pacientes</p>
          </div>
        </div>
        <button onClick={() => setFullscreen(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all hover:shadow-violet-600/40">
          <ExternalLink className="w-4 h-4" /> Abrir Painel TV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">Fila de Chamadas ({callQueue.length})</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">As chamadas são feitas pela Recepção, Triagem ou Consultório</p>
        </div>
        <div className="divide-y divide-slate-50">
          {callQueue.length === 0 ? (
            <div className="py-16 text-center">
              <Monitor className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Nenhuma chamada na fila</p>
              <p className="text-slate-300 text-xs mt-1">Chame um paciente pela lista de atendimentos</p>
            </div>
          ) : (
            callQueue.map((call, i) => (
              <div key={call.id} className={`px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition ${i === 0 ? 'bg-blue-50/30' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</div>
                  <div>
                    <p className="font-semibold text-slate-800">{call.patientName}</p>
                    <p className="text-[11px] text-slate-500">{call.sector} • {call.room}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">{new Date(call.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  <button onClick={() => removeCall(call.id)} className="text-xs text-red-400 hover:text-red-600 font-medium transition">Remover</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
