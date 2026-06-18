import { useStore } from '../store';
import { X, Info } from 'lucide-react';
import { useState } from 'react';

export default function FieldInfoModal() {
  const { showFieldInfo, setShowFieldInfo, routines, updateRoutine, currentUser } = useStore();
  const [editing, setEditing] = useState(false);

  if (!showFieldInfo) return null;
  const routine = routines.find(r => r.code === showFieldInfo.routineCode);
  const field = routine?.fields.find(f => f.fieldName === showFieldInfo.fieldName);
  if (!routine || !field) return null;
  const isAdmin = currentUser?.role === 'admin';

  const handleSave = (key: string, value: number | boolean) => {
    const updatedFields = routine.fields.map(f =>
      f.fieldName === field.fieldName ? { ...f, [key]: value } : f
    );
    updateRoutine({ ...routine, fields: updatedFields });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in" onClick={() => { setShowFieldInfo(null); setEditing(false); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-in-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Info className="w-5 h-5" /></div>
            <div>
              <p className="font-bold text-sm">Informações do Campo</p>
              <p className="text-white/70 text-xs">Pressione F1 em qualquer campo</p>
            </div>
          </div>
          <button onClick={() => { setShowFieldInfo(null); setEditing(false); }} className="p-1.5 hover:bg-white/20 rounded-lg transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Rotina</p>
              <p className="font-bold text-indigo-700 text-lg mt-0.5">{routine.code}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Módulo</p>
              <p className="font-semibold text-slate-800 mt-0.5 capitalize">{routine.module.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Campo</p>
            <p className="font-semibold mt-0.5">{field.label} <span className="text-slate-400 text-xs font-mono">({field.fieldName})</span></p>
          </div>

          {!editing ? (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Máx. Caracteres', value: String(field.maxLength), color: 'text-slate-900' },
                { label: 'Obrigatório', value: field.required ? 'Sim' : 'Não', color: field.required ? 'text-red-600' : 'text-slate-400' },
                { label: 'Visível', value: field.visible ? 'Sim' : 'Não', color: field.visible ? 'text-emerald-600' : 'text-slate-400' },
                { label: 'Editável', value: field.editable ? 'Sim' : 'Não', color: field.editable ? 'text-blue-600' : 'text-slate-400' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center">
                <label className="text-xs text-slate-600 font-medium">Máx. Caracteres</label>
                <input type="number" defaultValue={field.maxLength}
                  className="w-20 border border-slate-300 rounded-lg px-2 py-1 text-right text-sm font-bold"
                  onChange={e => handleSave('maxLength', parseInt(e.target.value) || field.maxLength)} />
              </div>
              {['required', 'visible', 'editable'].map(key => (
                <div key={key} className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center">
                  <label className="text-xs text-slate-600 font-medium capitalize">{key === 'required' ? 'Obrigatório' : key === 'visible' ? 'Visível' : 'Editável'}</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={(field as unknown as Record<string, unknown>)[key] as boolean}
                      className="sr-only peer" onChange={e => handleSave(key, e.target.checked)} />
                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {isAdmin && (
            <button onClick={() => setEditing(!editing)}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${editing ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'}`}>
              {editing ? '✓ Salvar Alterações' : '✏️ Editar Configurações'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
