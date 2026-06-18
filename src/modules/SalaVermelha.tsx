import { useState, useEffect } from 'react';
import { useStore } from '../store';
import SmartInput from '../components/SmartInput';
import { Home, ChevronRight, AlertTriangle, Heart, Activity, Droplets, Thermometer, Brain, Clock, Plus, FileText, Pill, Printer, CheckCircle2, X, Trash2 } from 'lucide-react';
import type { VitalSigns, Prescription } from '../types';

function timeSince(d: string): string { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 60) return `${m}min`; return `${Math.floor(m / 60)}h${m % 60}m`; }

export default function SalaVermelha() {
  const { attendances, updateAttendance, currentUser } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const [showVitals, setShowVitals] = useState(false);
  const [showPresc, setShowPresc] = useState(false);

  const [pa, setPa] = useState(''); const [fc, setFc] = useState('');
  const [satO2, setSatO2] = useState(''); const [temp, setTemp] = useState('');
  const [glicemia, setGlicemia] = useState(''); const [glasgow, setGlasgow] = useState('');
  const [procedures, setProcedures] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [med, setMed] = useState(''); const [dos, setDos] = useState('');
  const [route, setRoute] = useState(''); const [freq, setFreq] = useState('');

  useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 30000); return () => clearInterval(i); }, []);

  const patients = attendances.filter(a => a.isRedRoom && a.status !== 'ENCERRADO');
  const selected = selectedId ? attendances.find(a => a.id === selectedId) : null;

  const select = (id: string) => { const att = attendances.find(a => a.id === id); if (!att) return; setSelectedId(id); setProcedures(att.medicalRecord?.history || ''); setPrescriptions(att.medicalRecord?.prescriptions || []); };
  const saveVitals = () => { if (!selectedId) return; const vs: VitalSigns = { pa, fc, satO2, temp, glicemia, peso: '', altura: '', timestamp: new Date().toISOString() }; updateAttendance(selectedId, { vitalSigns: vs }); setShowVitals(false); setPa(''); setFc(''); setSatO2(''); setTemp(''); setGlicemia(''); setGlasgow(''); };
  const saveProcedures = () => { if (!selectedId) return; const att = attendances.find(a => a.id === selectedId); updateAttendance(selectedId, { medicalRecord: { history: procedures, physicalExam: '', diagnosis: '', cidCode: '', cidName: '', prescriptions, exams: att?.medicalRecord?.exams || [], certificates: [], referrals: [] } }); };
  const addPresc = () => { if (!med) return; setPrescriptions([...prescriptions, { id: `pr${Date.now()}`, type: 'local', medication: med, dosage: dos, route, frequency: freq, notes: '' }]); setMed(''); setDos(''); setRoute(''); setFreq(''); setShowPresc(false); };
  const discharge = () => { if (!selectedId) return; saveProcedures(); updateAttendance(selectedId, { status: 'ENCERRADO', isRedRoom: false }); setSelectedId(null); setProcedures(''); setPrescriptions([]); };
  const doPrint = (doc: string) => { if (!selectedId) return; const att = attendances.find(a => a.id === selectedId); if (!att) return; updateAttendance(selectedId, { printLog: [...att.printLog, { documentType: doc, timestamp: new Date().toISOString(), userId: currentUser?.id || '' }] }); alert(`🖨️ "${doc}" enviado.`); };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400"><Home className="w-3.5 h-3.5" /><ChevronRight className="w-3 h-3" /><span className="text-red-600 font-semibold">Sala Vermelha</span></nav>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center animate-pulse-glow"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
        <div><h1 className="text-xl font-bold text-red-800">Sala Vermelha — Emergência</h1><p className="text-xs text-slate-500">{patients.length} paciente(s) • Monitoramento contínuo</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-red-200/50 overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-red-50/50 border-b border-red-100"><h3 className="font-bold text-sm text-red-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Pacientes</h3></div>
          <div className="divide-y divide-red-50 max-h-[calc(100vh-320px)] overflow-y-auto">
            {patients.length === 0 ? <p className="text-slate-400 text-sm text-center py-12">Nenhum paciente</p> : patients.map(att => (
              <button key={att.id} onClick={() => select(att.id)} className={`w-full text-left px-5 py-4 transition hover:bg-red-50/50 ${selectedId === att.id ? 'bg-red-100/50 border-l-4 border-red-600' : ''}`}>
                <div className="flex items-center justify-between"><div><p className="font-bold text-sm text-slate-800">{att.patient.socialName || att.patient.name}</p><p className="text-[11px] text-slate-500">{att.patient.age}a</p></div><span className="text-[10px] text-red-600 font-mono flex items-center gap-1"><Clock className="w-3 h-3" />{timeSince(att.entryTime)}</span></div>
                {att.vitalSigns && <div className="mt-2 flex gap-1.5 flex-wrap">{[['PA', att.vitalSigns.pa], ['FC', att.vitalSigns.fc], ['Sat', att.vitalSigns.satO2 + '%']].map(([l, v]) => <span key={l} className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100">{l}: {v}</span>)}</div>}
                {att.mainComplaint && <p className="text-[11px] text-slate-500 mt-1 truncate">{att.mainComplaint}</p>}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-16 text-center"><AlertTriangle className="w-16 h-16 text-slate-200 mx-auto mb-4" /><p className="text-lg text-slate-400">Selecione um paciente</p></div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-red-200/50 p-5">
                <div className="flex items-center justify-between">
                  <div><h2 className="text-lg font-bold text-slate-900">{selected.patient.socialName || selected.patient.name}</h2><p className="text-xs text-slate-500">{selected.patient.age}a • CPF: {selected.patient.cpf}</p></div>
                  <div className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{timeSince(selected.entryTime)}</div>
                </div>
              </div>

              {/* Monitor */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-400" /><h3 className="text-white font-bold text-sm">Monitor</h3></div>
                  <button onClick={() => setShowVitals(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"><Plus className="w-3.5 h-3.5" />Atualizar</button>
                </div>
                {selected.vitalSigns ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { i: <Heart className="w-5 h-5" />, l: 'PA', v: selected.vitalSigns.pa, c: 'text-red-400', bg: 'bg-red-500/10' },
                      { i: <Activity className="w-5 h-5" />, l: 'FC', v: `${selected.vitalSigns.fc}`, c: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                      { i: <Droplets className="w-5 h-5" />, l: 'SatO2', v: `${selected.vitalSigns.satO2}%`, c: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                      { i: <Thermometer className="w-5 h-5" />, l: 'Temp', v: `${selected.vitalSigns.temp}°C`, c: 'text-orange-400', bg: 'bg-orange-500/10' },
                      { i: <Droplets className="w-5 h-5" />, l: 'Glic.', v: selected.vitalSigns.glicemia || '—', c: 'text-purple-400', bg: 'bg-purple-500/10' },
                    ].map(v => (
                      <div key={v.l} className={`${v.bg} rounded-2xl p-4 text-center`}>
                        <div className={`${v.c} flex justify-center mb-2`}>{v.i}</div>
                        <p className="text-white text-xl font-bold font-mono">{v.v}</p>
                        <p className="text-slate-500 text-[10px] mt-1 uppercase font-bold">{v.l}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center text-slate-500 py-8">Nenhum sinal vital registrado</p>}
                {selected.vitalSigns && <p className="text-slate-600 text-[10px] mt-3 text-right font-mono">Última: {new Date(selected.vitalSigns.timestamp).toLocaleTimeString('pt-BR')}</p>}
              </div>

              {/* Procedures */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                <div className="flex items-center gap-2.5 mb-4"><FileText className="w-5 h-5 text-blue-600" /><h3 className="font-bold text-sm text-slate-900">Procedimentos e Evolução</h3><span className="text-[10px] text-slate-400 ml-auto">SV01</span></div>
                <SmartInput routineCode="SV01" fieldName="procedures" value={procedures} onChange={setProcedures} type="textarea" placeholder="Procedimentos, evolução, intercorrências..." />
                <button onClick={saveProcedures} className="mt-3 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition">💾 Salvar</button>
              </div>

              {/* Prescriptions */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
                <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-sm text-slate-900 flex items-center gap-2"><Pill className="w-4 h-4 text-orange-600" />Prescrições</h3>
                  <div className="flex gap-2"><button onClick={() => doPrint('Prescrições')} className="text-blue-600 text-xs font-semibold flex items-center gap-1"><Printer className="w-3.5 h-3.5" />Imprimir</button><button onClick={() => setShowPresc(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"><Plus className="w-3.5 h-3.5" />Adicionar</button></div>
                </div>
                {prescriptions.length === 0 ? <p className="text-slate-400 text-sm text-center py-4">Nenhuma prescrição</p> : (
                  <div className="space-y-2">{prescriptions.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
                      <div className="flex items-center gap-3"><span className="text-[10px] text-slate-400 font-mono">{i + 1}.</span><div><p className="font-semibold text-slate-800">{p.medication}</p><p className="text-[11px] text-slate-500">{p.dosage} • {p.route} • {p.frequency}</p></div></div>
                      <button onClick={() => setPrescriptions(prescriptions.filter(x => x.id !== p.id))} className="p-1 hover:bg-red-50 rounded text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}</div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => { saveProcedures(); doPrint('Evolução SV'); }} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"><Printer className="w-4 h-4" />Imprimir Evolução</button>
                <button onClick={discharge} className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"><CheckCircle2 className="w-4 h-4" />Alta da Sala Vermelha</button>
              </div>
            </>
          )}
        </div>
      </div>

      {showVitals && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={() => setShowVitals(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slide-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-2xl"><h3 className="font-bold text-sm flex items-center gap-2"><Activity className="w-5 h-5" />Atualizar Sinais Vitais</h3><button onClick={() => setShowVitals(false)}><X className="w-5 h-5" /></button></div>
            <div className="p-5 space-y-3">
              <p className="text-[10px] text-slate-400 font-medium">SV01 • {new Date().toLocaleTimeString('pt-BR')}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { i: <Heart className="w-3 h-3 text-red-500" />, l: 'PA', f: 'pa', v: pa, s: setPa, p: '120/80' },
                  { i: <Activity className="w-3 h-3 text-blue-500" />, l: 'FC', f: 'fc', v: fc, s: setFc, p: 'bpm' },
                  { i: <Droplets className="w-3 h-3 text-cyan-500" />, l: 'SatO2', f: 'satO2', v: satO2, s: setSatO2, p: '%' },
                  { i: <Thermometer className="w-3 h-3 text-orange-500" />, l: 'Temp', f: 'temp' as const, v: temp, s: setTemp, p: '°C' },
                  { i: <Droplets className="w-3 h-3 text-purple-500" />, l: 'Glicemia', f: 'glicemia' as const, v: glicemia, s: setGlicemia, p: 'mg/dL' },
                  { i: <Brain className="w-3 h-3 text-slate-500" />, l: 'Glasgow', f: 'glasgow', v: glasgow, s: setGlasgow, p: '3-15' },
                ].map(x => (
                  <div key={x.l}><label className="flex items-center gap-1 text-xs font-semibold text-slate-600 mb-1 uppercase">{x.i}{x.l}</label>
                    {['pa', 'fc', 'satO2', 'glasgow'].includes(x.f) ? <SmartInput routineCode="SV01" fieldName={x.f} value={x.v} onChange={x.s} placeholder={x.p} autoFocus={x.f === 'pa'} /> : <input value={x.v} onChange={e => x.s(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder={x.p} />}
                  </div>
                ))}
              </div>
              <button onClick={saveVitals} disabled={!pa || !fc} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-2.5 rounded-xl font-semibold text-sm">✓ Salvar Sinais</button>
            </div>
          </div>
        </div>
      )}

      {showPresc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={() => setShowPresc(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slide-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-2xl"><h3 className="font-bold text-sm flex items-center gap-2"><Pill className="w-5 h-5" />Prescrição Emergência</h3><button onClick={() => setShowPresc(false)}><X className="w-5 h-5" /></button></div>
            <div className="p-5 space-y-3">
              <div><label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Medicamento *</label><input value={med} onChange={e => setMed(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" placeholder="Nome" autoFocus /></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Dosagem</label><input value={dos} onChange={e => setDos(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" placeholder="500mg" /></div><div><label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Via</label><input value={route} onChange={e => setRoute(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" placeholder="IV, IM..." /></div></div>
              <div><label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Frequência</label><input value={freq} onChange={e => setFreq(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm" placeholder="Dose única, 8/8h..." /></div>
              <button onClick={addPresc} disabled={!med} className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white py-2.5 rounded-xl font-semibold text-sm">Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
