import { useState } from 'react';
import { useStore } from '../store';
import SmartInput from '../components/SmartInput';
import { UserPlus, Search, Megaphone, Home, ChevronRight, Stethoscope, BarChart3, Eye, Filter, X, Trash2, Edit2, Clock } from 'lucide-react';
import type { Attendance, Patient, AttendanceStatus } from '../types';

const STATUS_MAP: Record<AttendanceStatus, { label: string; style: string }> = {
  AGUARDANDO_TRIAGEM: { label: 'Ag. Triagem', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  EM_TRIAGEM: { label: 'Em Triagem', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  AGUARDANDO_MEDICO: { label: 'Ag. Médico', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  EM_ATENDIMENTO: { label: 'Em Atendimento', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  AGUARDANDO_MEDICACAO: { label: 'Ag. Medicação', style: 'bg-orange-50 text-orange-700 border-orange-200' },
  EM_MEDICACAO: { label: 'Em Medicação', style: 'bg-pink-50 text-pink-700 border-pink-200' },
  EM_REAVALIACAO: { label: 'Reavaliação', style: 'bg-violet-50 text-violet-700 border-violet-200' },
  ENCERRADO: { label: 'Encerrado', style: 'bg-slate-50 text-slate-500 border-slate-200' },
};

function timeSince(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60) return `${mins}min`;
  return `${Math.floor(mins / 60)}h${mins % 60}m`;
}

export default function Recepcao() {
  const { attendances, addAttendance, updateAttendance, currentUser, setModule, addCall, users } = useStore();
  const [view, setView] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [calledName, setCalledName] = useState<string | null>(null);
  
  // Patient form
  const [name, setName] = useState('');
  const [socialName, setSocialName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profession, setProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isTourist, setIsTourist] = useState(false);
  const [hasCompanion, setHasCompanion] = useState(false);
  const [companionName, setCompanionName] = useState('');
  
  // New fields: doctor, room, order
  const [assignedDoctor, setAssignedDoctor] = useState('');
  const [assignedRoom, setAssignedRoom] = useState('');
  const [attendanceOrder, setAttendanceOrder] = useState('');

  const riskOrder = (r: string | null) => ({ vermelho: 0, laranja: 1, amarelo: 2, verde: 3, azul: 4 }[r || ''] ?? 5);
  const activeAttendances = attendances
    .filter(a => a.status !== 'ENCERRADO')
    .filter(a => {
      if (onlyMine) return a.assignedDoctor === currentUser?.id || a.assignedNurse === currentUser?.id;
      if (!search) return true;
      const s = search.toLowerCase();
      return a.patient.name.toLowerCase().includes(s) || a.patient.cpf.includes(s) || a.patient.socialName.toLowerCase().includes(s);
    })
    .sort((a, b) => riskOrder(a.riskClassification) - riskOrder(b.riskClassification));

  const calcAge = (dob: string) => { const d = new Date(dob); const n = new Date(); let a = n.getFullYear() - d.getFullYear(); if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--; return a; };

  const handleAdd = () => {
    if (!name || !cpf) return;
    const patient: Patient = { id: `p${Date.now()}`, name, socialName, cpf, birthDate, age: birthDate ? calcAge(birthDate) : 0, profession, isTourist, hasCompanion, companionName, phone, address };
    const att: Attendance = { 
      id: `a${Date.now()}`, 
      patient, 
      entryTime: new Date().toISOString(), 
      status: 'AGUARDANDO_TRIAGEM', 
      riskClassification: null, 
      mainComplaint: '', 
      vitalSigns: null, 
      medicalRecord: null, 
      assignedDoctor: assignedDoctor || null, 
      assignedDoctorName: assignedDoctor ? users.find(u => u.id === assignedDoctor)?.name : undefined,
      assignedNurse: null, 
      assignedRoom: assignedRoom || undefined,
      attendanceOrder: attendanceOrder ? parseInt(attendanceOrder) : undefined,
      isRedRoom: false, 
      printLog: [] 
    };
    addAttendance(att);
    setName('');
    setSocialName('');
    setCpf('');
    setBirthDate('');
    setProfession('');
    setPhone('');
    setAddress('');
    setIsTourist(false);
    setHasCompanion(false);
    setCompanionName('');
    setAssignedDoctor('');
    setAssignedRoom('');
    setAttendanceOrder('');
    setView('list');
  };

  const handleCall = (att: Attendance) => {
    const pName = att.patient.socialName || att.patient.name;
    setCalledName(pName);
    addCall({ 
      id: `c${Date.now()}`, 
      patientName: pName, 
      sector: 'Recepção', 
      room: att.assignedRoom || 'Guichê 1', 
      timestamp: new Date().toISOString(), 
      attendanceId: att.id 
    });
    setTimeout(() => setCalledName(null), 4000);
  };

  const doctors = users.filter(u => u.role === 'medico');
  const rooms = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5', 'Consultório A', 'Consultório B'];

  if (view === 'add') return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Home className="w-3.5 h-3.5" /><ChevronRight className="w-3 h-3" /><span>Recepção</span><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Adicionar Cidadão</span>
      </nav>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><UserPlus className="w-5 h-5 text-emerald-600" /></div>
            <div><h2 className="font-bold text-lg text-slate-900">Cadastro de Cidadão</h2><p className="text-[11px] text-slate-400 mt-0.5">Rotina REC01 • Pressione F1 para informações do campo</p></div>
          </div>
          <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SmartInput routineCode="REC01" fieldName="name" value={name} onChange={setName} label="Nome Completo" placeholder="Nome completo do paciente" autoFocus />
              <SmartInput routineCode="REC01" fieldName="socialName" value={socialName} onChange={setSocialName} label="Nome Social" placeholder="Nome social (se houver)" />
              <SmartInput routineCode="REC01" fieldName="cpf" value={cpf} onChange={setCpf} label="CPF" placeholder="000.000.000-00" />
              <SmartInput routineCode="REC01" fieldName="birthDate" value={birthDate} onChange={setBirthDate} label="Data de Nascimento" type="date" />
              <SmartInput routineCode="REC01" fieldName="profession" value={profession} onChange={setProfession} label="Profissão" placeholder="Profissão" />
              <SmartInput routineCode="REC01" fieldName="phone" value={phone} onChange={setPhone} label="Telefone" placeholder="(00) 00000-0000" />
            </div>
            <div className="mt-4">
              <SmartInput routineCode="REC01" fieldName="address" value={address} onChange={setAddress} label="Endereço" placeholder="Endereço completo" />
            </div>
          </div>

          {/* Informações Adicionais */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-amber-600 rounded-full"></div>
              Informações Adicionais
            </h3>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isTourist ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                  {isTourist && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <input type="checkbox" checked={isTourist} onChange={e => setIsTourist(e.target.checked)} className="sr-only" />
                <span className="text-sm font-medium text-slate-700">Turista</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${hasCompanion ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                  {hasCompanion && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <input type="checkbox" checked={hasCompanion} onChange={e => setHasCompanion(e.target.checked)} className="sr-only" />
                <span className="text-sm font-medium text-slate-700">Possui Acompanhante</span>
              </label>
            </div>
            {hasCompanion && (
              <div className="animate-slide-in-up mt-4">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Nome do Acompanhante</label>
                <input value={companionName} onChange={e => setCompanionName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium" placeholder="Nome completo" />
              </div>
            )}
          </div>

          {/* Atribuição Médica */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-cyan-600 rounded-full"></div>
              Atribuição Médica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Médico (Opcional)</label>
                <select value={assignedDoctor} onChange={e => setAssignedDoctor(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium bg-white">
                  <option value="">Selecione um médico</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Sala (Opcional)</label>
                <select value={assignedRoom} onChange={e => setAssignedRoom(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium bg-white">
                  <option value="">Selecione uma sala</option>
                  {rooms.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Ordem (Opcional)</label>
                <input type="number" value={attendanceOrder} onChange={e => setAttendanceOrder(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium" placeholder="Número da ordem" min="1" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={() => setView('list')} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancelar</button>
          <button onClick={handleAdd} disabled={!name || !cpf}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Adicionar à Fila
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Home className="w-3.5 h-3.5" /><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Recepção</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><UserPlus className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Recepção</h1>
            <p className="text-xs text-slate-500">{activeAttendances.length} paciente(s) aguardando • {currentUser?.name}</p>
          </div>
        </div>
        <button onClick={() => setView('add')} className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-700/30 transition-all">
          <UserPlus className="w-4 h-4" /> Novo Cidadão
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, CPF ou nome social..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium" />
        </div>
        <button onClick={() => setOnlyMine(!onlyMine)} className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${onlyMine ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
          <Filter className="w-3.5 h-3.5" /> {onlyMine ? 'Meus' : 'Todos'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {['Paciente', 'Idade', 'CPF', 'Médico', 'Sala', 'Ordem', 'Status', 'Tempo', 'Ações'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeAttendances.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">Nenhum paciente na fila</p>
                </td>
              </tr>
            ) : (
              activeAttendances.map((att, idx) => (
                <tr key={att.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition ${att.isRedRoom ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-8 rounded-full ${att.riskClassification === 'vermelho' ? 'bg-red-500' : att.riskClassification === 'laranja' ? 'bg-orange-500' : att.riskClassification === 'amarelo' ? 'bg-amber-400' : att.riskClassification === 'verde' ? 'bg-emerald-500' : 'bg-blue-400'}`} />
                      <div>
                        <p className="font-semibold text-slate-800">{att.patient.socialName || att.patient.name}</p>
                        <p className="text-[10px] text-slate-400">{att.patient.cpf}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{att.patient.age}a</td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-mono">{att.patient.cpf}</td>
                  <td className="px-4 py-3">
                    {att.assignedDoctorName ? (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 font-semibold">{att.assignedDoctorName}</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {att.assignedRoom ? (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">{att.assignedRoom}</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {att.attendanceOrder ? (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">#{att.attendanceOrder}</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${STATUS_MAP[att.status].style}`}>{STATUS_MAP[att.status].label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{timeSince(att.entryTime)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleCall(att)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition" title="Chamar"><Megaphone className="w-4 h-4" /></button>
                      <button onClick={() => setModule('triagem')} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition" title="Triagem"><Eye className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
