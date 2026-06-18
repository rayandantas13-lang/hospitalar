import { useStore } from '../store';
import {
  LayoutDashboard, UserPlus, Stethoscope,
  Package, AlertTriangle, Settings, LogOut, ChevronLeft, ChevronRight, Monitor
} from 'lucide-react';
import { useState } from 'react';
import type { ModuleType } from '../types';

const menuItems: { key: ModuleType | 'dashboard'; label: string; icon: React.ReactNode; color: string; accent: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, color: 'text-blue-400', accent: 'bg-blue-500/10 text-blue-400' },
  { key: 'recepcao', label: 'Recepção', icon: <UserPlus className="w-[18px] h-[18px]" />, color: 'text-emerald-400', accent: 'bg-emerald-500/10 text-emerald-400' },
  { key: 'consultorio', label: 'Consultório', icon: <Stethoscope className="w-[18px] h-[18px]" />, color: 'text-cyan-400', accent: 'bg-cyan-500/10 text-cyan-400' },
  { key: 'almoxarifado', label: 'Almoxarifado', icon: <Package className="w-[18px] h-[18px]" />, color: 'text-amber-400', accent: 'bg-amber-500/10 text-amber-400' },
  { key: 'sala_vermelha', label: 'Sala Vermelha', icon: <AlertTriangle className="w-[18px] h-[18px]" />, color: 'text-red-400', accent: 'bg-red-500/10 text-red-400' },
  { key: 'painel_chamada', label: 'Painel de Chamada', icon: <Monitor className="w-[18px] h-[18px]" />, color: 'text-violet-400', accent: 'bg-violet-500/10 text-violet-400' },
  { key: 'admin', label: 'Configurador', icon: <Settings className="w-[18px] h-[18px]" />, color: 'text-slate-400', accent: 'bg-slate-500/10 text-slate-300' },
];

export default function Sidebar() {
  const { currentUser, currentModule, setModule, logout, hasPermission } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!currentUser) return null;

  const visibleItems = menuItems.filter(item => {
    if (item.key === 'dashboard') return true;
    if (item.key === 'admin') return currentUser.role === 'admin';
    return hasPermission(item.key as ModuleType);
  });

  return (
    <div className={`${collapsed ? 'w-[68px]' : 'w-[240px]'} bg-slate-950 min-h-screen flex flex-col transition-all duration-300 relative border-r border-slate-800/50`}>
      {/* Logo */}
      <div className={`p-4 ${collapsed ? 'px-3' : 'px-5'} border-b border-slate-800/50 flex items-center gap-3`}>
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <span className="text-base font-black text-white">H</span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h2 className="text-white font-bold text-sm leading-none">HealthSys</h2>
            <p className="text-slate-500 text-[10px] mt-0.5">UPA 24 Horas</p>
          </div>
        )}
      </div>

      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[60px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-10 border border-slate-700 transition-all">
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {!collapsed && <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest px-3 mb-2 mt-1">Menu</p>}
        {visibleItems.map(item => {
          const active = currentModule === item.key;
          return (
            <button key={item.key} onClick={() => setModule(item.key as ModuleType | 'dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all relative group ${
                active ? `${item.accent} font-semibold` : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
              title={collapsed ? item.label : undefined}>
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full" />}
              <span className={`flex-shrink-0 ${active ? item.color : ''}`}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-800/50">
        {!collapsed && (
          <div className="mb-3 px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">{currentUser.avatar || currentUser.name.split(' ').map(n => n[0]).join('').slice(0,2)}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{currentUser.name}</p>
                <p className="text-slate-500 text-[10px] capitalize">{currentUser.role === 'admin' ? 'Administrador' : currentUser.role}</p>
              </div>
            </div>
          </div>
        )}
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg text-xs font-medium transition-all"
          title="Sair do sistema">
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Sair do sistema'}
        </button>
      </div>
    </div>
  );
}
