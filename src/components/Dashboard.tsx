import { useStore } from '../store';
import { Users, Clock, AlertTriangle, Stethoscope, Activity, Package, TrendingUp, ArrowRight, ShoppingCart } from 'lucide-react';

export default function Dashboard() {
  const { attendances, stockItems, currentUser, purchaseOrders, setModule } = useStore();
  const waiting = attendances.filter(a => a.status === 'AGUARDANDO_TRIAGEM' || a.status === 'AGUARDANDO_MEDICO');
  const inProgress = attendances.filter(a => a.status === 'EM_ATENDIMENTO' || a.status === 'EM_TRIAGEM');
  const redRoom = attendances.filter(a => a.isRedRoom && a.status !== 'ENCERRADO');
  const lowStock = stockItems.filter(s => s.quantity <= s.minQuantity);
  const total = attendances.filter(a => a.status !== 'ENCERRADO').length;
  const finished = attendances.filter(a => a.status === 'ENCERRADO').length;
  const pendingPO = purchaseOrders.filter(p => p.status === 'AGUARDANDO_APROVACAO').length;

  const riskOrder = (r: string | null) => ({ vermelho: 0, laranja: 1, amarelo: 2, verde: 3, azul: 4 }[r || ''] ?? 5);

  const stats = [
    { label: 'Ativos', value: total, icon: <Users className="w-5 h-5" />, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Aguardando', value: waiting.length, icon: <Clock className="w-5 h-5" />, gradient: 'from-amber-500 to-orange-500' },
    { label: 'Em Atendimento', value: inProgress.length, icon: <Stethoscope className="w-5 h-5" />, gradient: 'from-emerald-500 to-green-600' },
    { label: 'Sala Vermelha', value: redRoom.length, icon: <AlertTriangle className="w-5 h-5" />, gradient: 'from-red-500 to-rose-600' },
    { label: 'Encerrados', value: finished, icon: <TrendingUp className="w-5 h-5" />, gradient: 'from-slate-500 to-slate-600' },
    { label: 'Estoque Baixo', value: lowStock.length, icon: <Package className="w-5 h-5" />, gradient: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-slate-500 text-sm">Bem-vindo(a) de volta,</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{currentUser?.name}</h1>
          <p className="text-slate-400 text-xs mt-1">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {currentUser?.unit}</p>
        </div>
        <div className="flex gap-2">
          {pendingPO > 0 && currentUser?.role === 'admin' && (
            <button onClick={() => setModule('almoxarifado')}
              className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-all">
              <ShoppingCart className="w-4 h-4" /> {pendingPO} Pedido(s) p/ Aprovar
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-md hover:shadow-slate-200/50 transition-all group">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>{s.icon}</div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Activity className="w-4 h-4 text-blue-600" /></div>
              <h3 className="font-bold text-slate-900 text-sm">Fila de Espera</h3>
            </div>
            <button onClick={() => setModule('recepcao')} className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">Ver todos <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="divide-y divide-slate-50 max-h-[350px] overflow-y-auto">
            {waiting.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-12">Nenhum paciente aguardando</p>
            ) : (
              waiting.sort((a, b) => riskOrder(a.riskClassification) - riskOrder(b.riskClassification)).map(a => (
                <div key={a.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${
                    a.riskClassification === 'vermelho' ? 'bg-red-500' : a.riskClassification === 'laranja' ? 'bg-orange-500' : a.riskClassification === 'amarelo' ? 'bg-amber-400' : a.riskClassification === 'verde' ? 'bg-emerald-500' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{a.patient.socialName || a.patient.name}</p>
                    <p className="text-[11px] text-slate-500">{a.patient.age}a • {a.patient.profession || 'N/I'}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${a.status === 'AGUARDANDO_TRIAGEM' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>
                    {a.status === 'AGUARDANDO_TRIAGEM' ? 'Ag. Triagem' : 'Ag. Médico'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Red Room & Low Stock */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-red-200/50 overflow-hidden">
            <div className="px-5 py-4 bg-red-50/50 border-b border-red-100 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center animate-pulse-glow"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
              <h3 className="font-bold text-red-800 text-sm">Sala Vermelha</h3>
            </div>
            <div className="divide-y divide-red-50 max-h-[160px] overflow-y-auto">
              {redRoom.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Nenhum paciente</p>
              ) : (
                redRoom.map(a => (
                  <div key={a.id} className="px-5 py-3">
                    <p className="font-semibold text-sm text-red-900">{a.patient.socialName || a.patient.name}</p>
                    <p className="text-[11px] text-red-700/70 truncate">{a.mainComplaint || '—'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-orange-600" /></div>
              <h3 className="font-bold text-slate-900 text-sm">Alertas de Estoque</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[160px] overflow-y-auto">
              {lowStock.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Estoque OK</p>
              ) : (
                lowStock.map(i => (
                  <div key={i.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{i.name}</p>
                      <p className="text-[11px] text-slate-500">{i.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-red-600">{i.quantity}</p>
                      <p className="text-[10px] text-slate-400">mín: {i.minQuantity}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
