'use client';

import { FaultAlert } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AlarmLogProps {
  alerts: FaultAlert[];
  onAcknowledge: (id: string) => void;
  isDark?: boolean;
}

export function AlarmLog({ alerts, onAcknowledge }: AlarmLogProps) {
  const supabase = createClient();

  const handleAck = async (id: string) => {
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      await supabase
        .from('fault_alerts')
        .update({ is_acknowledged: true })
        .eq('id', id);
    }
    onAcknowledge(id);
  };

  const activeAlerts = alerts.filter((a) => !a.is_acknowledged);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col h-full font-mono transition-colors duration-150 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wider">
            SYSTEM ALARM &amp; EVENT LOG
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Triggered by Multi-Tier Inference Engine
          </p>
        </div>
        <span
          className={`px-2.5 py-1 text-xs rounded font-bold border ${
            activeAlerts.length > 0
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
          }`}
        >
          {activeAlerts.length} ACTIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[260px] pr-1">
        {activeAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 dark:text-slate-500 py-12 gap-2 text-center">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <span>No unacknowledged alarm events.</span>
            <span className="text-[10px] text-slate-400">All 4 fan channels operating within safety envelope.</span>
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded border text-xs flex items-start justify-between gap-3 transition-colors ${
                alert.severity === 'CRITICAL'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold tracking-tight">{alert.message}</p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    [{alert.severity}] Fan #{alert.fan_id} • {new Date(alert.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleAck(alert.id)}
                className="px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded transition shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                ACK
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
