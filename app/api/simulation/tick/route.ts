import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { simulateFanStep } from '@/lib/simulation/engine';
import { FanMode } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { source = 'NASA_CMAPSS', cycle = 1, modes = {} } = await req.json().catch(() => ({}));
    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    const results = [];
    const fansToProcess = [1, 2, 3, 4];

    if (isSupabaseConfigured) {
      const supabase = await createClient();
      const { data: fans } = await supabase
        .from('fans')
        .select('*')
        .order('fan_id', { ascending: true });

      const fanList = fans && fans.length > 0 ? fans : fansToProcess.map(id => ({ fan_id: id, simulation_mode: 'Random' as FanMode }));

      const updates = [];
      const readingsToInsert = [];
      const alertsToInsert = [];

      for (const fan of fanList) {
        const mode: FanMode = (modes[fan.fan_id] as FanMode) || fan.simulation_mode || 'Random';
        const step = simulateFanStep(fan.fan_id, mode, source, cycle);
        const newStatus = step.predicted_rul < 15.0 ? 'Critical' : step.predicted_rul < 40.0 ? 'Warning' : 'Normal';

        updates.push(
          supabase
            .from('fans')
            .update({
              current_rul: step.predicted_rul,
              current_fault: step.predicted_fault,
              is_anomaly: step.is_anomaly,
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('fan_id', fan.fan_id)
        );

        readingsToInsert.push({
          fan_id: fan.fan_id,
          speed: step.speed,
          vibration: step.vibration,
          temperature: step.temperature,
          power: step.power,
          gas: step.gas,
          pressure: step.pressure,
          predicted_rul: step.predicted_rul,
          predicted_fault: step.predicted_fault,
          is_anomaly: step.is_anomaly,
        });

        if (newStatus === 'Critical') {
          alertsToInsert.push({
            fan_id: fan.fan_id,
            alert_type: 'CRITICAL_RUL',
            severity: 'CRITICAL',
            message: `CRITICAL: RUL dropped to ${step.predicted_rul}d! Scheduled shutdown recommended. Fault: ${step.predicted_fault}`,
          });
        } else if (step.is_anomaly) {
          alertsToInsert.push({
            fan_id: fan.fan_id,
            alert_type: 'ANOMALY',
            severity: 'WARNING',
            message: `Statistical Anomaly flagged on Fan ${fan.fan_id} (Vib: ${step.vibration} mm/s, Temp: ${step.temperature} °C)`,
          });
        }

        results.push({
          fan_id: fan.fan_id,
          status: newStatus,
          rul: step.predicted_rul,
          fault: step.predicted_fault,
          is_anomaly: step.is_anomaly,
          telemetry: step,
        });
      }

      await Promise.allSettled(updates);
      if (readingsToInsert.length > 0) {
        await supabase.from('telemetry_readings').insert(readingsToInsert);
      }
      if (alertsToInsert.length > 0) {
        await supabase.from('fault_alerts').insert(alertsToInsert);
      }
    } else {
      // In-memory simulation fallback if Supabase URL is not yet connected
      for (const fanId of fansToProcess) {
        const mode = modes[fanId] || 'Random';
        const step = simulateFanStep(fanId, mode, source, cycle);
        const newStatus = step.predicted_rul < 15.0 ? 'Critical' : step.predicted_rul < 40.0 ? 'Warning' : 'Normal';

        results.push({
          fan_id: fanId,
          status: newStatus,
          rul: step.predicted_rul,
          fault: step.predicted_fault,
          is_anomaly: step.is_anomaly,
          telemetry: step,
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      cycle,
      source,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
