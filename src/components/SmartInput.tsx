import { useStore } from '../store';
import type { KeyboardEvent } from 'react';

interface SmartInputProps {
  routineCode: string;
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  label?: string;
  icon?: React.ReactNode;
}

export default function SmartInput({
  routineCode, fieldName, value, onChange,
  type = 'text', placeholder, className = '', autoFocus, onKeyDown, label, icon
}: SmartInputProps) {
  const { setShowFieldInfo, getFieldConfig } = useStore();
  const config = getFieldConfig(routineCode, fieldName);
  if (config && !config.visible) return null;
  const maxLength = config?.maxLength || 255;
  const isRequired = config?.required || false;
  const isEditable = config?.editable !== false;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'F1') {
      e.preventDefault();
      setShowFieldInfo({ routineCode, fieldName });
    }
    onKeyDown?.(e);
  };

  const shortcuts: Record<string, string> = {
    '.dor': 'Paciente relata dor intensa em região abdominal',
    '.cefaleia': 'Paciente relata cefaleia intensa com início súbito',
    '.febre': 'Paciente apresenta quadro febril há mais de 24 horas',
    '.dispneia': 'Paciente relata dispneia aos mínimos esforços',
    '.toracica': 'Paciente relata dor torácica de início súbito',
    '.vomito': 'Paciente apresenta episódios de vômito e náuseas',
    '.tontura': 'Paciente relata tontura e vertigem persistente',
  };

  const handleChange = (val: string) => {
    let finalVal = val;
    Object.entries(shortcuts).forEach(([shortcut, expansion]) => {
      if (finalVal.endsWith(shortcut)) finalVal = finalVal.replace(shortcut, expansion);
    });
    if (finalVal.length <= maxLength) onChange(finalVal);
  };

  const base = `w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200 outline-none border ${
    !isEditable
      ? 'bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200'
      : isRequired && !value
        ? 'bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        : 'bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
  } ${className}`;

  const wrapper = label ? 'space-y-1.5' : '';

  const content = type === 'textarea' ? (
    <div className="relative">
      <textarea value={value} onChange={e => handleChange(e.target.value)} onKeyDown={handleKeyDown}
        placeholder={placeholder} className={`${base} min-h-[100px] resize-y`}
        maxLength={maxLength} disabled={!isEditable} autoFocus={autoFocus} required={isRequired} />
      <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-medium">{value.length}/{maxLength}</span>
    </div>
  ) : (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
      <input type={type} value={value} onChange={e => handleChange(e.target.value)} onKeyDown={handleKeyDown}
        placeholder={placeholder} className={`${base} ${icon ? 'pl-10' : ''}`}
        maxLength={maxLength} disabled={!isEditable} autoFocus={autoFocus} required={isRequired} />
    </div>
  );

  if (!label) return content;
  return (
    <div className={wrapper}>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {label} {isRequired && <span className="text-red-400">*</span>}
      </label>
      {content}
    </div>
  );
}
