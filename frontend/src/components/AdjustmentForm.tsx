import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabaseClient';
import { REASON_LABELS } from '../lib/api';
import WarningBanner from './WarningBanner';
import { Loader2, Save } from 'lucide-react';

interface AdjustmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
  managerEmail: string;
  managerName: string;
  employees: any[];
}

interface FormData {
  employee_id: string;
  date: string;
  entry_time: string;
  break_out_time: string;
  break_in_time: string;
  exit_time: string;
  reason: string;
  note: string;
}

export default function AdjustmentForm({ onClose, onSuccess, managerEmail, managerName, employees }: AdjustmentFormProps) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [warnings, setWarnings] = useState<string[]>([]);

  // Watch fields for validation logic
  const entryTime = watch('entry_time');
  const exitTime = watch('exit_time');
  const breakOut = watch('break_out_time');
  const breakIn = watch('break_in_time');

  useEffect(() => {
    const newWarnings: string[] = [];
    
    // Regra: Entrada > 08:10 (Considerando tolerância de 10 min sobre 08:00)
    if (entryTime && entryTime > '08:10') {
      newWarnings.push("Entrada fora da tolerância (após 08:10). Colaborador deve se explicar.");
    }
    
    // Regra: Saída > 18:10 (Considerando tolerância de 10 min sobre 18:00)
    if (exitTime && exitTime > '18:10') {
      newWarnings.push("Saída fora da tolerância (após 18:10).");
    }

    // Validações de consistência
    if (entryTime && exitTime && entryTime >= exitTime) {
      newWarnings.push("Atenção: A hora de saída deve ser posterior à entrada.");
    }
    if (breakOut && breakIn && breakOut >= breakIn) {
      newWarnings.push("Atenção: O retorno do intervalo deve ser posterior à saída.");
    }

    setWarnings(newWarnings);
  }, [entryTime, exitTime, breakOut, breakIn]);

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase.from('adjustments').insert({
        employee_id: data.employee_id,
        manager_name: managerName,
        manager_email: managerEmail,
        date: data.date,
        entry_time: data.entry_time,
        break_out_time: data.break_out_time || null,
        break_in_time: data.break_in_time || null,
        exit_time: data.exit_time,
        reason: data.reason,
        note: data.note
      });

      if (error) throw error;
      onSuccess();
    } catch (err) {
      alert("Erro ao salvar ajuste. Verifique o console.");
      console.error(err);
    }
  };

  const inputClass = "w-full bg-surface border border-border text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-600";
  const labelClass = "block text-xs font-medium text-secondary mb-1.5";

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-semibold tracking-tight">Novo Ajuste de Ponto</h2>
        <button onClick={onClose} className="text-xs text-secondary hover:text-white kbd">ESC</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5">
        
        {/* Colaborador e Data */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Colaborador</label>
            <select {...register('employee_id', { required: true })} className={inputClass}>
              <option value="">Selecione...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Data</label>
            <input type="date" {...register('date', { required: true })} className={inputClass} />
          </div>
        </div>

        {/* Horários */}
        <div>
          <label className={labelClass}>Horários (Jornada Padrão: 08:00 - 18:00)</label>
          <div className="grid grid-cols-4 gap-2 bg-surface/50 p-3 rounded-lg border border-border">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Entrada</span>
              <input type="time" {...register('entry_time', { required: true })} className={inputClass} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Saída Int.</span>
              <input type="time" {...register('break_out_time')} className={inputClass} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Volta Int.</span>
              <input type="time" {...register('break_in_time')} className={inputClass} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Saída</span>
              <input type="time" {...register('exit_time', { required: true })} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Avisos Dinâmicos */}
        {warnings.length > 0 && (
          <div className="space-y-1">
            {warnings.map((w, i) => <WarningBanner key={i} message={w} />)}
          </div>
        )}

        {/* Motivo e Observação */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Motivo</label>
            <select {...register('reason', { required: true })} className={inputClass}>
              {Object.entries(REASON_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Observação (Opcional)</label>
            <input type="text" {...register('note')} className={inputClass} placeholder="Detalhes extras..." />
          </div>
        </div>
      </form>

      <div className="p-6 border-t border-border bg-surface/30 flex justify-end gap-3">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-4 py-2 text-sm text-secondary hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button 
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          Salvar Ajuste <span className="text-zinc-400 text-xs ml-1">↵</span>
        </button>
      </div>
    </div>
  );
}