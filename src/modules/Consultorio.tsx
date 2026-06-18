import { useState } from 'react';
import { useStore } from '../store';
import SmartInput from '../components/SmartInput';
import { Home, ChevronRight, Stethoscope, Heart, Activity, Droplets, Thermometer, Pill, FileText, FlaskConical, ArrowRight, Printer, Plus, Trash2, X, CheckCircle2, Eye, Send, Pause, Megaphone, Users } from 'lucide-react';
import type { Prescription, ExamRequest } from '../types';

const CID_DB = [
  { code: 'J06', name: 'Infecções agudas das vias aéreas superiores' },
  { code: 'J11', name: 'Influenza devida a vírus não identificado' },
  { code: 'R10', name: 'Dor abdominal e pélvica' },
  { code: 'R51', name: 'Cefaleia' },
  { code: 'I10', name: 'Hipertensão essencial (primária)' },
  { code: 'E11', name: 'Diabetes mellitus tipo 2' },
  { code: 'M54', name: 'Dorsalgia' },
  { code: 'K29', name: 'Gastrite e duodenite' },
  { code: 'N39', name: 'Outros transtornos do trato urinário' },
  { code: 'A09', name: 'Diarreia e gastroenterite infecciosa' },
  { code: 'I20', name: 'Angina pectoris' },
  { code: 'J18', name: 'Pneumonia por microrganismo não especificado' },
  { code: 'R07', name: 'Dor de garganta e no peito' },
];

export default function Consultorio() {
  const { attendances, updateAttendance, currentUser, addCall, users } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [showFinalize, setShowFinalize] = useState(false);
  const [filterRoom, setFilterRoom] = useState<string>('');

  const [history, setHistory] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [cidSearch, setCidSearch] = useState('');
  const [selectedCid, setSelectedCid] = useState<{ code: string; name: string } | null>(null);
  const [showCidDrop, setShowCidDrop] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [exams, setExams] = useState<ExamRequest[]>([]);

  // Presc form
  const [pType, setPType] = useState<'local' | 'domiciliar'>('local');
  const [pMed, setPMed] = useState('');
  const [pDos, setPDos] = useState('');
  const [pRoute, setPRoute] = useState('');
  const [pFreq, setPFreq] = useState('');
  const [pNotes, setPNotes] = useState('');

  // Exam form
  const [eType, setEType] = useState<'interno' | 'externo'>('interno');
  const [eName, setEName] = useState('');
  const [eNotes, setENotes] = useState('');

  // Cert form
  const [certType, setCertType] = useState<'comparecimento' | 'afastamento'>('comparecimento');
  const [certDays, setCertDays] = useState('1');
  const [certNotes, setCertNotes] = useState('');

  // Referral
  const [refSpec, setRefSpec] = useState('');
  const [refNotes, setRefNotes] = useState('');

  // Filter by doctor and room
  const isAdmin = currentUser?.role === 'admin';
  const doctorId = isAdmin ? null : currentUser?.id;
  
  const queue = attendances
    .filter(a => ['AGUARDANDO_MEDICO', 'EM_ATENDIMENTO', 'EM_REAVALIACAO'].includes(a.status))
    .filter(a => isAdmin ? true : a.assignedDoctor === doctorId || a.assignedDoctor === null)
    .filter(a => filterRoom ? a.assignedRoom === filterRoom : true)
    .sort((a, b) => {
      const orderA = a.attendanceOrder || 999;
      const orderB = b.attendanceOrder || 999;
      return orderA - orderB;
    });

  const selected = selectedId ? attendances.find(a => a.id === selectedId) : null;

  const startAtt = (id: string) => {
    const att = attendances.find(a => a.id === id);
    if (!att) return;
    setSelectedId(id);
    updateAttendance(id, { 
      status: 'EM_ATENDIMENTO', 
      assignedDoctor: currentUser?.id || null,
      assignedDoctorName: currentUser?.name
    });
    if (att.medicalRecord) {
      setHistory(att.medicalRecord.history);
      setPhysicalExam(att.medicalRecord.physicalExam);
      setDiagnosis(att.medicalRecord.diagnosis);
      if (att.medicalRecord.cidCode) setSelectedCid({ code: att.medicalRecord.cidCode, name: att.medicalRecord.cidName });
      setPrescriptions(att.medicalRecord.prescriptions);
      setExams(att.medicalRecord.exams);
    } else {
      setHistory('');
      setPhysicalExam('');
      setDiagnosis('');
      setSelectedCid(null);
      setPrescriptions([]);
      setExams([]);
    }
  };

  const saveRecord = () => {
    if (!selectedId) return;
    updateAttendance(selectedId, {
      medicalRecord: {
        history,
        physicalExam,
        diagnosis,
        cidCode: selectedCid?.code || '',
        cidName: selectedCid?.name || '',
        prescriptions,
        exams,
        certificates: [],
        referrals: []
      }
    });
  };

  const doFinalize = (action: 'encerrar' | 'medicacao' | 'reavaliacao') => {
    if (!selectedId) return;
    saveRecord();
    updateAttendance(selectedId, {
      status: action === 'encerrar' ? 'ENCERRADO' : action === 'medicacao' ? 'AGUARDANDO_MEDICACAO' : 'EM_REAVALIACAO'
    });
    setSelectedId(null);
    setShowFinalize(false);
    setHistory('');
    setPhysicalExam('');
    setDiagnosis('');
    setSelectedCid(null);
    setPrescriptions([]);
    setExams([]);
  };

  const addPresc = () => {
    if (!pMed) return;
    setPrescriptions([...prescriptions, {
      id: `pr${Date.now()}`,
      type: pType,
      medication: pMed,
      dosage: pDos,
      route: pRoute,
      frequency: pFreq,
      notes: pNotes
    }]);
    setPMed('');
    setPDos('');
    setPRoute('');
    setPFreq('');
    setPNotes('');
  };

  const addExam = () => {
    if (!eName) return;
    setExams([...exams, {
      id: `ex${Date.now()}`,
      type: eType,
      examName: eName,
      notes: eNotes,
      status: 'solicitado'
    }]);
    setEName('');
    setENotes('');
  };

  const handlePrint = (docType: string) => {
    if (!selectedId) return;
    const att = attendances.find(a => a.id === selectedId);
    if (!att) return;
    updateAttendance(selectedId, {
      printLog: [...att.printLog, {
        documentType: docType,
        timestamp: new Date().toISOString(),
        userId: currentUser?.id || ''
      }]
    });
    alert(`🖨️ "${docType}" enviado para impressão.\nPaciente: ${att.patient.name}\nMédico: ${currentUser?.name}`);
  };

  const filteredCid = cidSearch
    ? CID_DB.filter(c => c.code.toLowerCase().includes(cidSearch.toLowerCase()) || c.name.toLowerCase().includes(cidSearch.toLowerCase()))
    : [];

  const ModalWrap = ({ title, color, onClose, children }: { title: string; color: string; onClose: () => void; children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-slide-in-up" onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between p-5 ${color} text-white rounded-t-2xl`}>
          <h3 className="font-bold text-sm">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );

  if (selected) return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-4 animate-fade-in">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Home className="w-3.5 h-3.5" />
        <ChevronRight className="w-3 h-3" />
        <span>Consultório</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-700 font-semibold">{selected.patient.socialName || selected.patient.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{selected.patient.socialName || selected.patient.name}</h2>
            <p className="text-xs text-slate-500">{selected.patient.age}a • CPF: {selected.patient.cpf} • {selected.patient.profession}</p>
            {selected.assignedRoom && <p className="text-xs text-blue-600 font-semibold mt-1">📍 Sala: {selected.assignedRoom}</p>}
          </div>
          <div className={`px-4 py-2 rounded-xl font-bold text-sm text-white ${selected.riskClassification === 'vermelho' ? 'bg-red-600' : selected.riskClassification === 'laranja' ? 'bg-orange-500' : selected.riskClassification === 'amarelo' ? 'bg-amber-500' : selected.riskClassification === 'verde' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
            {selected.riskClassification?.toUpperCase() || 'N/C'}
          </div>
        </div>
        {selected.vitalSigns && (
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {[
              { i: <Heart className="w-3 h-3 text-red-500" />, l: 'PA', v: selected.vitalSigns.pa },
              { i: <Activity className="w-3 h-3 text-blue-500" />, l: 'FC', v: selected.vitalSigns.fc + ' bpm' },
              { i: <Droplets className="w-3 h-3 text-cyan-500" />, l: 'SatO2', v: selected.vitalSigns.satO2 + '%' },
              { i: <Thermometer className="w-3 h-3 text-orange-500" />, l: 'Temp', v: selected.vitalSigns.temp + '°C' },
              { i: <Droplets className="w-3 h-3 text-purple-500" />, l: 'Glicemia', v: selected.vitalSigns.glicemia || '—' },
              { i: null, l: 'Peso', v: selected.vitalSigns.peso ? selected.vitalSigns.peso + 'kg' : '—' },
              { i: null, l: 'Altura', v: selected.vitalSigns.altura ? selected.vitalSigns.altura + 'cm' : '—' },
            ].map(x => (
              <div key={x.l} className="bg-slate-50 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  {x.i}
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{x.l}</span>
                </div>
                <p className="font-bold text-sm text-slate-800">{x.v}</p>
              </div>
            ))}
          </div>
        )}
        {selected.mainComplaint && (
          <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-[10px] font-bold text-amber-700 uppercase mb-0.5">Queixa Principal</p>
            <p className="text-sm text-slate-700">{selected.mainComplaint}</p>
          </div>
        )}
      </div>

      {/* Clinical Evolution */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-cyan-600" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Evolução Clínica</h3>
          <span className="text-[10px] text-slate-400 ml-auto">CONS01 • Pressione F1</span>
        </div>
        <SmartInput routineCode="CONS01" fieldName="history" value={history} onChange={setHistory} type="textarea" label="História da Doença Atual" placeholder="Anamnese..." autoFocus />
        <SmartInput routineCode="CONS01" fieldName="physicalExam" value={physicalExam} onChange={setPhysicalExam} type="textarea" label="Exame Físico" placeholder="Observações clínicas..." />
        <SmartInput routineCode="CONS01" fieldName="diagnosis" value={diagnosis} onChange={setDiagnosis} label="Diagnóstico" placeholder="Diagnóstico clínico..." />
        <div className="relative">
          <SmartInput routineCode="CONS01" fieldName="cidCode" value={cidSearch} onChange={v => { setCidSearch(v); setShowCidDrop(true); }} label="CID (Busca)" placeholder="Código ou nome..." />
          {showCidDrop && filteredCid.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto">
              {filteredCid.map(c => (
                <button key={c.code} onClick={() => { setSelectedCid(c); setCidSearch(`${c.code} - ${c.name}`); setShowCidDrop(false); }} className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm border-b last:border-0">
                  <span className="font-bold text-blue-600">{c.code}</span>
                  <span className="text-slate-600 ml-2">{c.name}</span>
                </button>
              ))}
            </div>
          )}
          {selectedCid && (
            <div className="mt-2 flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200">
                {selectedCid.code} — {selectedCid.name}
              </span>
              <button onClick={() => { setSelectedCid(null); setCidSearch(''); }} className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Plan Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
        <h3 className="font-bold text-sm text-slate-900 mb-4">📋 Plano</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { k: 'presc', l: 'Prescrição', i: <Pill className="w-5 h-5 text-blue-600" />, c: prescriptions.length },
            { k: 'cert', l: 'Atestados', i: <FileText className="w-5 h-5 text-emerald-600" />, c: 0 },
            { k: 'exams', l: 'Exames', i: <FlaskConical className="w-5 h-5 text-violet-600" />, c: exams.length },
            { k: 'ref', l: 'Encaminhamento', i: <ArrowRight className="w-5 h-5 text-orange-600" />, c: 0 },
          ].map(act => (
            <button key={act.k} onClick={() => setModal(act.k)} className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
              <div className="group-hover:scale-110 transition-transform">{act.i}</div>
              <span className="text-xs font-semibold text-slate-700">{act.l}</span>
              {act.c > 0 && <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">{act.c}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Presc List */}
      {prescriptions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-600" />
              Prescrições
            </h4>
            <button onClick={() => handlePrint('Prescrições')} className="text-blue-600 text-xs font-semibold flex items-center gap-1">
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>
          <div className="space-y-2">
            {prescriptions.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono w-5">{i + 1}.</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.type === 'local' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {p.type === 'local' ? 'Local' : 'Domic.'}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{p.medication}</p>
                    <p className="text-[11px] text-slate-500">{p.dosage} • {p.route} • {p.frequency}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handlePrint(`Presc - ${p.medication}`)} className="p-1 hover:bg-blue-50 rounded-lg text-blue-600">
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setPrescriptions(prescriptions.filter(x => x.id !== p.id))} className="p-1 hover:bg-red-50 rounded-lg text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exams List */}
      {exams.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-violet-600" />
              Exames
            </h4>
            <button onClick={() => handlePrint('Exames')} className="text-violet-600 text-xs font-semibold flex items-center gap-1">
              <Printer className="w-3.5 h-3.5" />
              Imprimir Guias
            </button>
          </div>
          <div className="space-y-2">
            {exams.map((e, i) => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono w-5">{i + 1}.</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${e.type === 'interno' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {e.type === 'interno' ? 'Interno' : 'Externo'}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{e.examName}</p>
                    {e.notes && <p className="text-[11px] text-slate-500">{e.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handlePrint(`Guia - ${e.examName}`)} className="p-1 hover:bg-violet-50 rounded-lg text-violet-600">
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setExams(exams.filter(x => x.id !== e.id))} className="p-1 hover:bg-red-50 rounded-lg text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => { saveRecord(); setShowFinalize(true); }} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl text-base font-bold shadow-2xl shadow-blue-600/25 transition-all flex items-center justify-center gap-3">
        <CheckCircle2 className="w-6 h-6" />
        Salvar Atendimento
      </button>

      {/* Modals */}
      {modal === 'presc' && (
        <ModalWrap title="💊 Prescrição" color="bg-gradient-to-r from-blue-600 to-blue-700" onClose={() => setModal(null)}>
          <div className="flex gap-2">
            <button onClick={() => setPType('local')} className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition ${pType === 'local' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>💉 Local</button>
            <button onClick={() => setPType('domiciliar')} className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition ${pType === 'domiciliar' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>🏠 Domiciliar</button>
          </div>
          <SmartInput routineCode="CONS02" fieldName="medication" value={pMed} onChange={setPMed} label="Medicamento" placeholder="Nome do medicamento" />
          <div className="grid grid-cols-2 gap-3">
            <SmartInput routineCode="CONS02" fieldName="dosage" value={pDos} onChange={setPDos} label="Dosagem" placeholder="500mg" />
            <SmartInput routineCode="CONS02" fieldName="route" value={pRoute} onChange={setPRoute} label="Via" placeholder="Oral, IV..." />
          </div>
          <SmartInput routineCode="CONS02" fieldName="frequency" value={pFreq} onChange={setPFreq} label="Frequência" placeholder="8/8h, 12/12h..." />
          <textarea value={pNotes} onChange={e => setPNotes(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm min-h-[50px] font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Observações..." />
          <button onClick={addPresc} disabled={!pMed} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 disabled:from-slate-300 disabled:to-slate-300 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </ModalWrap>
      )}
      {modal === 'exams' && (
        <ModalWrap title="🔬 Solicitação de Exames" color="bg-gradient-to-r from-violet-600 to-purple-600" onClose={() => setModal(null)}>
          <div className="flex gap-2">
            <button onClick={() => setEType('interno')} className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition ${eType === 'interno' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>🏥 Interno</button>
            <button onClick={() => setEType('externo')} className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition ${eType === 'externo' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>📤 Externo</button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Exame *</label>
            <input value={eName} onChange={e => setEName(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="Hemograma, Raio-X..." />
          </div>
          <textarea value={eNotes} onChange={e => setENotes(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm min-h-[50px] font-medium outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="Indicação clínica..." />
          <button onClick={addExam} disabled={!eName} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 disabled:from-slate-300 disabled:to-slate-300 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Solicitar
          </button>
        </ModalWrap>
      )}
      {modal === 'cert' && (
        <ModalWrap title="📑 Atestados / Laudos" color="bg-gradient-to-r from-emerald-600 to-green-600" onClose={() => setModal(null)}>
          <div className="flex gap-2">
            <button onClick={() => setCertType('comparecimento')} className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition ${certType === 'comparecimento' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Comparecimento</button>
            <button onClick={() => setCertType('afastamento')} className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition ${certType === 'afastamento' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>Afastamento</button>
          </div>
          {certType === 'afastamento' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Dias</label>
              <input type="number" value={certDays} onChange={e => setCertDays(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" min="1" />
            </div>
          )}
          <textarea value={certNotes} onChange={e => setCertNotes(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm min-h-[50px] font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Observações..." />
          <button onClick={() => { handlePrint(`Atestado de ${certType}`); setModal(null); }} className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </ModalWrap>
      )}
      {modal === 'ref' && (
        <ModalWrap title="↩️ Encaminhamento" color="bg-gradient-to-r from-orange-500 to-orange-600" onClose={() => setModal(null)}>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Especialidade</label>
            <input value={refSpec} onChange={e => setRefSpec(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="Cardiologia..." />
          </div>
          <textarea value={refNotes} onChange={e => setRefNotes(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm min-h-[60px] font-medium outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="Motivo..." />
          <button onClick={() => { handlePrint(`Encaminhamento - ${refSpec}`); setModal(null); }} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </ModalWrap>
      )}

      {/* Finalize Modal */}
      {showFinalize && (
        <ModalWrap title="✅ Finalizar Atendimento" color="bg-gradient-to-r from-emerald-600 to-green-600" onClose={() => setShowFinalize(false)}>
          <p className="text-sm text-slate-700 mb-4">Qual é o próximo passo para este paciente?</p>
          <div className="space-y-2">
            <button onClick={() => doFinalize('medicacao')} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <Pill className="w-4 h-4" />
              Encaminhar para Medicação
            </button>
            <button onClick={() => doFinalize('reavaliacao')} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <Pause className="w-4 h-4" />
              Agendar Reavaliação
            </button>
            <button onClick={() => doFinalize('encerrar')} className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Encerrar Atendimento
            </button>
          </div>
        </ModalWrap>
      )}
    </div>
  );

  // Queue view
  const uniqueRooms = Array.from(new Set(queue.map(a => a.assignedRoom).filter(Boolean)));

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-5">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Home className="w-3.5 h-3.5" />
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-700 font-semibold">Consultório — Fila Médica</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Fila do Consultório</h1>
            <p className="text-xs text-slate-500">
              {queue.length} paciente(s) • {isAdmin ? 'Administrador' : currentUser?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Room Filter */}
      {isAdmin && uniqueRooms.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 uppercase">Filtrar por sala:</span>
          <button
            onClick={() => setFilterRoom('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterRoom === '' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Todas
          </button>
          {uniqueRooms.map(room => (
            <button
              key={room}
              onClick={() => setFilterRoom(room)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterRoom === room ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {room}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
        {queue.length === 0 ? (
          <div className="py-16 text-center">
            <Stethoscope className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">Nenhum paciente aguardando</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {queue.map((att, idx) => (
              <div key={att.id} className={`px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition ${att.isRedRoom ? 'bg-red-50/30 border-l-4 border-red-500' : ''}`}>
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-2 h-10 rounded-full ${att.riskClassification === 'vermelho' ? 'bg-red-500' : att.riskClassification === 'laranja' ? 'bg-orange-500' : att.riskClassification === 'amarelo' ? 'bg-amber-400' : att.riskClassification === 'verde' ? 'bg-emerald-500' : 'bg-blue-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{att.patient.socialName || att.patient.name}</p>
                      {att.attendanceOrder && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">#{att.attendanceOrder}</span>}
                    </div>
                    <p className="text-[11px] text-slate-500">{att.patient.age}a • {att.mainComplaint || 'Sem queixa'}</p>
                    {att.assignedRoom && <p className="text-[10px] text-blue-600 font-semibold mt-0.5">📍 {att.assignedRoom}</p>}
                    <span className={`inline-flex mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${att.status === 'EM_REAVALIACAO' ? 'bg-amber-50 text-amber-700 border border-amber-200' : att.status === 'EM_ATENDIMENTO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
                      {att.status === 'EM_REAVALIACAO' ? 'Reavaliação' : att.status === 'EM_ATENDIMENTO' ? 'Em Atendimento' : 'Ag. Médico'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const n = att.patient.socialName || att.patient.name;
                      addCall({
                        id: `c${Date.now()}`,
                        patientName: n,
                        sector: 'Consultório',
                        room: att.assignedRoom || 'Sala Consultório',
                        timestamp: new Date().toISOString(),
                        attendanceId: att.id
                      });
                    }}
                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                    title="Chamar"
                  >
                    <Megaphone className="w-[18px] h-[18px]" />
                  </button>
                  <button
                    onClick={() => startAtt(att.id)}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/20"
                  >
                    <Eye className="w-4 h-4" />
                    {att.status === 'EM_REAVALIACAO' ? 'Reavaliar' : 'Atender'}
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
