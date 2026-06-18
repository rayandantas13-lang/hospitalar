import { useState } from 'react';
import { useStore } from '../store';
import SmartInput from '../components/SmartInput';
import { Home, ChevronRight, Activity, Heart, Thermometer, Droplets, Scale, Ruler, Clock, CheckCircle2, Megaphone } from 'lucide-react';
import type { Attendance, RiskClassification, VitalSigns } from '../types';

export default function Triagem() {
  const { attendances, updateAttendance, currentUser, addCall } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pa, setPa] = useState(''); const [fc, setFc] = useState('');
  const [satO2, setSatO2] = useState(''); const [temp, setTemp] = useState('');
  const [glicemia, setGlicemia] = useState(''); const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState(''); const [mainComplaint, setMainComplaint] = useState('');
  const [risk, setRisk] = useState<RiskClassification | null>(null);

  const queue = attendances.filter(a => a.status === 'AGUARDANDO_TRIAGEM' || a.status === 'EM_TRIAGEM');
  const selected = selectedId ? attendances.find(a => a.id === selectedId) : null;

  const start = (att: Attendance) => {
    setSelectedId(att.id);
    updateAttendance(att.id, { status: 'EM_TRIAGEM', assignedNurse: currentUser?.id || null });
    if (att.vitalSigns) { setPa(att.vitalSigns.pa); setFc(att.vitalSigns.fc); setSatO2(att.vitalSigns.satO2); setTemp(att.vitalSigns.temp); setGlicemia(att.vitalSigns.glicemia); setPeso(att.vitalSigns.peso); setAltura(att.vitalSigns.altura); }
    else { setPa(''); setFc(''); setSatO2(''); setTemp(''); setGlicemia(''); setPeso(''); setAltura(''); }
    setMainComplaint(att.mainComplaint || ''); setRisk(att.riskClassification);
  };

  const finalize = () => {
    if (!selectedId || !risk) return;
    const vs: VitalSigns = { pa, fc, satO2, temp, glicemia, peso, altura, timestamp: new Date().toISOString() };
    updateAttendance(selectedId, { status: 'AGUARDANDO_MEDICO', vitalSigns: vs, mainComplaint, riskClassification: risk, isRedRoom: risk === 'vermelho' });
    setSelectedId(null); setPa(''); setFc(''); setSatO2(''); setTemp(''); setGlicemia(''); setPeso(''); setAltura(''); setMainComplaint(''); setRisk(null);
  };

  const callPatient = (att: Attendance) => {
    const n = att.patient.socialName || att.patient.name;
    addCall({ id: `c${Date.now()}`, patientName: n, sector: 'Triagem', room: 'Sala 1', timestamp: new Date().toISOString(), attendanceId: att.id });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.altKey && e.key.toLowerCase() === 's') || (e.key === 'Enter' && risk && pa)) { e.preventDefault(); finalize(); }
  };

  if (selected) return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-5 animate-fade-in" onKeyDown={handleKeyDown}>
      <nav className="flex items-center gap-1.5 text-xs text-slate-400"><Home className="w-3.5 h-3.5" /><ChevronRight className="w-3 h-3" /><span>Triagem</span><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">{selected.patient.socialName || selected.patient.name}</span></nav>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-slate-900">{selected.patient.socialName || selected.patient.name}</h2><p className="text-xs text-slate-500 mt-0.5">{selected.patient.age}a • CPF: {selected.patient.cpf} • {selected.patient.profession}</p></div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl"><Clock className="w-4 h-4 text-slate-400" /><span className="text-sm font-mono text-slate-600">{new Date(selected.entryTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5"><div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center"><Activity className="w-4 h-4 text-emerald-600" /></div><h3 className="font-bold text-sm text-slate-900">Sinais Vitais</h3></div>
          <span className="text-[10px] text-slate-400 font-medium">TRI01 • Horário: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Heart className="w-3.5 h-3.5 text-red-500" />, l: 'PA', f: 'pa', v: pa, s: setPa, p: '120/80', af: true },
            { icon: <Activity className="w-3.5 h-3.5 text-blue-500" />, l: 'FC', f: 'fc', v: fc, s: setFc, p: 'bpm' },
            { icon: <Droplets className="w-3.5 h-3.5 text-cyan-500" />, l: 'SatO2', f: 'satO2', v: satO2, s: setSatO2, p: '%' },
            { icon: <Thermometer className="w-3.5 h-3.5 text-orange-500" />, l: 'Temp', f: 'temp', v: temp, s: setTemp, p: '°C' },
            { icon: <Droplets className="w-3.5 h-3.5 text-purple-500" />, l: 'Glicemia', f: 'glicemia', v: glicemia, s: setGlicemia, p: 'mg/dL' },
            { icon: <Scale className="w-3.5 h-3.5 text-slate-500" />, l: 'Peso', f: 'peso', v: peso, s: setPeso, p: 'kg' },
            { icon: <Ruler className="w-3.5 h-3.5 text-slate-500" />, l: 'Altura', f: 'altura', v: altura, s: setAltura, p: 'cm' },
          ].map(item => (
            <div key={item.f}>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">{item.icon}{item.l}</label>
              <SmartInput routineCode="TRI01" fieldName={item.f} value={item.v} onChange={item.s} placeholder={item.p} autoFocus={item.af} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-900">📋 Queixa Principal</h3>
          <span className="text-[10px] text-slate-400">TRI02 • Use atalhos: .dor .cefaleia .febre .dispneia</span>
        </div>
        <SmartInput routineCode="TRI02" fieldName="mainComplaint" value={mainComplaint} onChange={setMainComplaint} type="textarea" placeholder="Descreva a queixa principal... (use .dor, .cefaleia, .febre para atalhos)" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
        <h3 className="font-bold text-sm text-slate-900 mb-4">🎯 Classificação de Risco — Manchester</h3>
        <div className="grid grid-cols-5 gap-3">
          {([
            { v: 'azul' as RiskClassification, l: 'Não Urgente', g: 'from-blue-500 to-blue-600', r: 'ring-blue-400', t: '240min' },
            { v: 'verde' as RiskClassification, l: 'Pouco Urgente', g: 'from-emerald-500 to-green-600', r: 'ring-emerald-400', t: '120min' },
            { v: 'amarelo' as RiskClassification, l: 'Urgente', g: 'from-amber-400 to-yellow-500', r: 'ring-amber-400', t: '60min' },
            { v: 'laranja' as RiskClassification, l: 'Muito Urgente', g: 'from-orange-500 to-orange-600', r: 'ring-orange-400', t: '10min' },
            { v: 'vermelho' as RiskClassification, l: 'Emergência', g: 'from-red-600 to-rose-700', r: 'ring-red-400', t: '0min' },
          ]).map(item => (
            <button key={item.v} onClick={() => setRisk(item.v)}
              className={`bg-gradient-to-br ${item.g} text-white rounded-2xl py-5 px-3 font-bold text-center transition-all transform hover:scale-105 shadow-lg ${risk === item.v ? `ring-4 ${item.r} scale-105` : 'opacity-80 hover:opacity-100'}`}>
              <p className="text-sm leading-tight">{item.l}</p>
              <p className="text-[10px] opacity-70 mt-1.5">≤ {item.t}</p>
            </button>
          ))}
        </div>
      </div>

      <button onClick={finalize} disabled={!risk || !pa}
        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-slate-300 disabled:to-slate-300 text-white py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-3">
        <CheckCircle2 className="w-7 h-7" /> Finalizar e Classificar <span className="text-sm opacity-60 ml-2">(Alt+S)</span>
      </button>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-5">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400"><Home className="w-3.5 h-3.5" /><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Triagem — Fila</span></nav>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><Activity className="w-5 h-5 text-emerald-600" /></div>
        <div><h1 className="text-xl font-bold text-slate-900">Fila de Triagem</h1><p className="text-xs text-slate-500">{queue.length} paciente(s) aguardando</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
        {queue.length === 0 ? (
          <div className="py-16 text-center"><Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">Nenhum paciente aguardando triagem</p></div>
        ) : (
          <div className="divide-y divide-slate-50">
            {queue.map(att => (
              <div key={att.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                <div className="flex items-center gap-4">
                  <div className="text-center"><p className="text-xs text-slate-400 font-mono">{new Date(att.entryTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p></div>
                  <div><p className="font-semibold text-slate-800">{att.patient.socialName || att.patient.name}</p><p className="text-[11px] text-slate-500">{att.patient.age}a • CPF: {att.patient.cpf}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => callPatient(att)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition" title="Chamar"><Megaphone className="w-[18px] h-[18px]" /></button>
                  <button onClick={() => start(att)} className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-5 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:shadow-emerald-600/40">
                    <Activity className="w-4 h-4" /> Iniciar Triagem
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
