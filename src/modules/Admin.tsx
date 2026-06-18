import { useState } from 'react';
import { useStore } from '../store';
import { Home, ChevronRight, Settings, Users, Shield, Plus, Edit3, Trash2, X, Save, Key, Layers } from 'lucide-react';
import type { User, ModuleType, UserPermission } from '../types';

const MODULE_LABELS: Record<ModuleType, string> = {
  recepcao: 'Recepção', triagem: 'Triagem', consultorio: 'Consultório',
  almoxarifado: 'Almoxarifado', sala_vermelha: 'Sala Vermelha',
  painel_chamada: 'Painel de Chamada', admin: 'Administração',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador', medico: 'Médico', enfermeiro: 'Enfermeiro(a)',
  recepcionista: 'Recepcionista', farmaceutico: 'Farmacêutico(a)',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  medico: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  enfermeiro: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  recepcionista: 'bg-blue-50 text-blue-700 border-blue-200',
  farmaceutico: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function Admin() {
  const { users, addUser, updateUser, deleteUser, routines, updateRoutine } = useStore();
  const [tab, setTab] = useState<'users' | 'routines' | 'permissions'>('users');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);

  const [uName, setUName] = useState(''); const [uUsername, setUUsername] = useState('');
  const [uPassword, setUPassword] = useState(''); const [uRole, setURole] = useState<User['role']>('recepcionista');
  const [uUnit, setUUnit] = useState('UPA Central'); const [uPermissions, setUPermissions] = useState<UserPermission[]>([]);

  const openEditUser = (user: User) => { setEditingUser(user); setUName(user.name); setUUsername(user.username); setUPassword(user.password); setURole(user.role); setUUnit(user.unit); setUPermissions([...user.permissions]); };
  const openAddUser = () => { setShowAddUser(true); setUName(''); setUUsername(''); setUPassword(''); setURole('recepcionista'); setUUnit('UPA Central'); setUPermissions([]); };

  const toggleModule = (m: ModuleType) => {
    const ex = uPermissions.find(p => p.module === m);
    if (ex) setUPermissions(uPermissions.filter(p => p.module !== m));
    else setUPermissions([...uPermissions, { module: m, routines: ['*'] }]);
  };

  const toggleRoutine = (m: ModuleType, code: string) => {
    const ex = uPermissions.find(p => p.module === m);
    if (!ex) { setUPermissions([...uPermissions, { module: m, routines: [code] }]); return; }
    if (ex.routines.includes('*')) {
      const all = routines.filter(r => r.module === m).map(r => r.code);
      setUPermissions(uPermissions.map(p => p.module === m ? { ...p, routines: all.filter(c => c !== code) } : p));
    } else if (ex.routines.includes(code)) {
      const nr = ex.routines.filter(r => r !== code);
      if (nr.length === 0) setUPermissions(uPermissions.filter(p => p.module !== m));
      else setUPermissions(uPermissions.map(p => p.module === m ? { ...p, routines: nr } : p));
    } else { setUPermissions(uPermissions.map(p => p.module === m ? { ...p, routines: [...p.routines, code] } : p)); }
  };

  const hasRoutinePerm = (m: ModuleType, code: string) => { const p = uPermissions.find(x => x.module === m); return p ? p.routines.includes('*') || p.routines.includes(code) : false; };

  const saveUser = () => {
    if (!uName || !uUsername || !uPassword) return;
    if (editingUser) { updateUser({ ...editingUser, name: uName, username: uUsername, password: uPassword, role: uRole, unit: uUnit, permissions: uPermissions }); setEditingUser(null); }
    else { addUser({ id: `u${Date.now()}`, name: uName, username: uUsername, password: uPassword, role: uRole, unit: uUnit, permissions: uPermissions }); setShowAddUser(false); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400"><Home className="w-3.5 h-3.5" /><ChevronRight className="w-3 h-3" /><span className="text-slate-700 font-semibold">Configurador</span></nav>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center"><Settings className="w-5 h-5 text-slate-600" /></div>
        <div><h1 className="text-xl font-bold text-slate-900">Configurador do Sistema</h1><p className="text-xs text-slate-500">Gerencie usuários, permissões e rotinas</p></div>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {[
          { k: 'users' as const, l: 'Usuários', i: <Users className="w-4 h-4" /> },
          { k: 'routines' as const, l: 'Rotinas & Campos', i: <Layers className="w-4 h-4" /> },
          { k: 'permissions' as const, l: 'Permissões', i: <Shield className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${tab === t.k ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>{t.i}{t.l}</button>
        ))}
      </div>

      {/* Users */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Gerenciamento de Usuários</h3>
            <button onClick={openAddUser} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20"><Plus className="w-3.5 h-3.5" />Novo Usuário</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              {['Nome', 'Usuário', 'Perfil', 'Unidade', 'Módulos', ''].map(h => (
                <th key={h} className={`${h === '' ? 'text-right' : 'text-left'} px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider`}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{users.map(user => (
              <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td className="px-5 py-3"><div className="flex items-center gap-2.5"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-white text-[10px] font-bold">{user.avatar || user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span></div><span className="font-semibold text-slate-800">{user.name}</span></div></td>
                <td className="px-5 py-3 font-mono text-xs text-slate-500">{user.username}</td>
                <td className="px-5 py-3"><span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${ROLE_COLORS[user.role]}`}>{ROLE_LABELS[user.role]}</span></td>
                <td className="px-5 py-3 text-slate-500 text-xs">{user.unit}</td>
                <td className="px-5 py-3"><div className="flex gap-1 flex-wrap">{user.permissions.map(p => <span key={p.module} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{MODULE_LABELS[p.module]}</span>)}</div></td>
                <td className="px-5 py-3 text-right"><div className="flex items-center justify-end gap-0.5">
                  <button onClick={() => openEditUser(user)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition"><Edit3 className="w-4 h-4" /></button>
                  {user.role !== 'admin' && <button onClick={() => deleteUser(user.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"><Trash2 className="w-4 h-4" /></button>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* Routines */}
      {tab === 'routines' && (
        <div className="space-y-4">
          {Object.entries(MODULE_LABELS).filter(([k]) => k !== 'admin' && k !== 'painel_chamada').map(([mk, ml]) => {
            const mr = routines.filter(r => r.module === mk);
            return (
              <div key={mk} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 rounded-t-2xl"><h3 className="font-bold text-sm text-slate-800">{ml}</h3></div>
                <div className="divide-y divide-slate-50">{mr.map(routine => (
                  <div key={routine.code} className="p-5">
                    <div className="flex items-center justify-between">
                      <div><span className="font-mono text-blue-600 font-bold text-sm mr-2">{routine.code}</span><span className="font-semibold text-slate-800 text-sm">{routine.name}</span><p className="text-[11px] text-slate-400 mt-0.5">{routine.description}</p></div>
                      <button onClick={() => setEditingRoutine(editingRoutine === routine.code ? null : routine.code)} className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700"><Edit3 className="w-3.5 h-3.5" />{editingRoutine === routine.code ? 'Fechar' : 'Campos'}</button>
                    </div>
                    {editingRoutine === routine.code && (
                      <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden animate-slide-in-up">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-slate-50">{['Campo', 'Máx. Char', 'Obrigatório', 'Visível', 'Editável'].map(h => <th key={h} className={`${h === 'Campo' ? 'text-left' : 'text-center'} px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase`}>{h}</th>)}</tr></thead>
                          <tbody>{routine.fields.map(field => (
                            <tr key={field.fieldName} className="border-t border-slate-100">
                              <td className="px-4 py-2.5"><p className="font-medium text-slate-700">{field.label}</p><p className="text-slate-400 font-mono text-[10px]">{field.fieldName}</p></td>
                              <td className="px-4 py-2.5 text-center"><input type="number" defaultValue={field.maxLength} className="w-16 border border-slate-300 rounded-lg px-2 py-1 text-center text-xs" onChange={e => updateRoutine({ ...routine, fields: routine.fields.map(f => f.fieldName === field.fieldName ? { ...f, maxLength: parseInt(e.target.value) || field.maxLength } : f) })} /></td>
                              {['required', 'visible', 'editable'].map(k => (
                                <td key={k} className="px-4 py-2.5 text-center"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" defaultChecked={(field as unknown as Record<string, unknown>)[k] as boolean} className="sr-only peer" onChange={e => updateRoutine({ ...routine, fields: routine.fields.map(f => f.fieldName === field.fieldName ? { ...f, [k]: e.target.checked } : f) })} /><div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all"></div></label></td>
                              ))}
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Permissions Matrix */}
      {tab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-bold text-sm text-slate-900 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600" />Matriz de Permissões</h3><p className="text-[11px] text-slate-400 mt-0.5">Clique no usuário para editar</p></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50/50 border-b border-slate-100"><th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase min-w-[200px]">Usuário</th>
                {Object.entries(MODULE_LABELS).filter(([k]) => k !== 'admin').map(([k, l]) => <th key={k} className="text-center px-3 py-3 text-[10px] font-bold text-slate-500 uppercase">{l}</th>)}
              </tr></thead>
              <tbody>{users.map(user => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition" onClick={() => openEditUser(user)}>
                  <td className="px-5 py-3"><div className="flex items-center gap-2.5"><Key className="w-3.5 h-3.5 text-slate-400" /><div><p className="font-semibold text-sm">{user.name}</p><p className="text-[10px] text-slate-400">{ROLE_LABELS[user.role]}</p></div></div></td>
                  {Object.keys(MODULE_LABELS).filter(k => k !== 'admin').map(mk => {
                    const has = user.permissions.some(p => p.module === mk);
                    return <td key={mk} className="px-3 py-3 text-center"><div className={`w-4 h-4 rounded-full mx-auto ${has ? 'bg-emerald-500' : 'bg-slate-200'}`} /></td>;
                  })}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Modal */}
      {(editingUser || showAddUser) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={() => { setEditingUser(null); setShowAddUser(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-slide-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-2xl">
              <h3 className="font-bold text-sm flex items-center gap-2"><Users className="w-5 h-5" />{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => { setEditingUser(null); setShowAddUser(false); }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Nome Completo *</label><input value={uName} onChange={e => setUName(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Unidade</label><input value={uUnit} onChange={e => setUUnit(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Usuário *</label><input value={uUsername} onChange={e => setUUsername(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Senha *</label><input value={uPassword} onChange={e => setUPassword(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" /></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Perfil *</label>
                <div className="flex flex-wrap gap-2">{Object.entries(ROLE_LABELS).map(([k, l]) => (
                  <button key={k} onClick={() => setURole(k as User['role'])} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${uRole === k ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{l}</button>
                ))}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Permissões por Módulo e Rotina</label>
                <div className="space-y-2">{Object.entries(MODULE_LABELS).filter(([k]) => k !== 'admin').map(([mk, ml]) => {
                  const mr = routines.filter(r => r.module === mk);
                  const hasM = uPermissions.some(p => p.module === mk);
                  return (
                    <div key={mk} className={`border rounded-xl p-3 transition-all ${hasM ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200'}`}>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={hasM} onChange={() => toggleModule(mk as ModuleType)} className="accent-blue-600 w-3.5 h-3.5" /><span className="font-semibold text-sm text-slate-800">{ml}</span></label>
                      {hasM && mr.length > 0 && (
                        <div className="mt-2 ml-6 flex flex-wrap gap-2">{mr.map(r => (
                          <label key={r.code} className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-300 transition">
                            <input type="checkbox" checked={hasRoutinePerm(mk as ModuleType, r.code)} onChange={() => toggleRoutine(mk as ModuleType, r.code)} className="accent-blue-600 w-3 h-3" />
                            <span className="text-xs font-mono text-blue-700">{r.code}</span><span className="text-[10px] text-slate-500">{r.name}</span>
                          </label>
                        ))}</div>
                      )}
                    </div>
                  );
                })}</div>
              </div>
              <button onClick={saveUser} disabled={!uName || !uUsername || !uPassword}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 disabled:from-slate-300 disabled:to-slate-300 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                <Save className="w-4 h-4" />{editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
