'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Fan, FaultAlert, FanMode } from '@/lib/types';
import { RULChart, ChartPoint } from '@/components/dashboard/RULChart';
import { AlarmLog } from '@/components/dashboard/AlarmLog';
import { simulateFanStep } from '@/lib/simulation/engine';
import Link from 'next/link';
import {
  Play,
  Pause,
  LogOut,
  Radio,
  FastForward,
  Sun,
  Moon,
  Server,
  Database,
  Wifi,
  Activity,
  RotateCcw,
  Zap,
  Wrench,
  AlertTriangle,
  Gauge,
  Sliders,
  FileText,
} from 'lucide-react';

const INITIAL_FANS: Fan[] = [
  {
    id: '1',
    fan_id: 1,
    name: 'Tunnel Booster Fan #1',
    location: 'Zone A • Portal Ch. 1000',
    status: 'Normal',
    current_rul: 191.0,
    current_fault: 'Normal',
    is_anomaly: false,
    simulation_mode: 'Random',
    updated_at: new Date().toISOString(),
    latest_speed: 9850,
    latest_vibration: 1.25,
    latest_temperature: 55.4,
    latest_power: 49.2,
  },
  {
    id: '2',
    fan_id: 2,
    name: 'Tunnel Booster Fan #2',
    location: 'Zone B • Portal Ch. 2000',
    status: 'Normal',
    current_rul: 91.5,
    current_fault: 'Normal',
    is_anomaly: false,
    simulation_mode: 'Random',
    updated_at: new Date().toISOString(),
    latest_speed: 2470,
    latest_vibration: 2.15,
    latest_temperature: 62.8,
    latest_power: 54.1,
  },
  {
    id: '3',
    fan_id: 3,
    name: 'Tunnel Booster Fan #3',
    location: 'Zone C • Portal Ch. 3000',
    status: 'Normal',
    current_rul: 88.0,
    current_fault: 'Normal',
    is_anomaly: false,
    simulation_mode: 'Random',
    updated_at: new Date().toISOString(),
    latest_speed: 2510,
    latest_vibration: 2.45,
    latest_temperature: 64.2,
    latest_power: 55.6,
  },
  {
    id: '4',
    fan_id: 4,
    name: 'Tunnel Booster Fan #4',
    location: 'Zone D • Portal Ch. 4000',
    status: 'Normal',
    current_rul: 84.5,
    current_fault: 'Normal',
    is_anomaly: false,
    simulation_mode: 'Random',
    updated_at: new Date().toISOString(),
    latest_speed: 2540,
    latest_vibration: 2.65,
    latest_temperature: 65.5,
    latest_power: 56.4,
  },
];

const INITIAL_CHART_DATA: ChartPoint[] = [
  { step: 1, fan1: 191.0, fan2: 92.5, fan3: 88.0, fan4: 85.0 },
  { step: 2, fan1: 190.2, fan2: 91.8, fan3: 87.5, fan4: 84.6 },
  { step: 3, fan1: 189.5, fan2: 92.0, fan3: 88.2, fan4: 84.1 },
  { step: 4, fan1: 188.6, fan2: 91.2, fan3: 87.8, fan4: 83.9 },
  { step: 5, fan1: 187.9, fan2: 90.7, fan3: 88.0, fan4: 83.5 },
  { step: 6, fan1: 187.1, fan2: 91.5, fan3: 87.2, fan4: 83.0 },
  { step: 7, fan1: 186.4, fan2: 90.9, fan3: 87.9, fan4: 82.8 },
  { step: 8, fan1: 185.5, fan2: 91.4, fan3: 87.1, fan4: 82.4 },
  { step: 9, fan1: 184.8, fan2: 90.5, fan3: 86.8, fan4: 82.0 },
  { step: 10, fan1: 184.0, fan2: 91.0, fan3: 87.4, fan4: 81.6 },
];

export default function SCADADashboard() {
  const [fans, setFans] = useState<Fan[]>(INITIAL_FANS);
  const [alerts, setAlerts] = useState<FaultAlert[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>(INITIAL_CHART_DATA);
  const [cycle, setCycle] = useState(10);
  const [isStreaming, setIsStreaming] = useState(true);
  const [source, setSource] = useState<'NASA_CMAPSS' | 'SYNTHETIC'>('NASA_CMAPSS');
  const [isDark, setIsDark] = useState(false); // DEFAULT IS LIGHT THEME!
  const [liveTime, setLiveTime] = useState('');
  const [streamSpeed, setStreamSpeed] = useState<number>(2000);
  const [fanModes, setFanModes] = useState<Record<number, FanMode>>({
    1: 'Random',
    2: 'Random',
    3: 'Random',
    4: 'Random',
  });

  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cycleRef = useRef(10);
  const router = useRouter();
  const supabase = createClient();

  // 1. Theme Management (Light by default, saved in localStorage)
  useEffect(() => {
    const savedTheme = localStorage.getItem('tbf_scada_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('tbf_scada_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('tbf_scada_theme', 'light');
      }
      return next;
    });
  };

  // Live Clock Ticker
  useEffect(() => {
    setLiveTime(new Date().toLocaleTimeString());
    const clockTimer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // 2. Initial Data Load from Supabase (if configured)
  useEffect(() => {
    async function loadInitialData() {
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
      ) {
        const { data: fansData } = await supabase
          .from('fans')
          .select('*')
          .order('fan_id', { ascending: true });
        if (fansData && fansData.length > 0) {
          setFans(fansData);
        }

        const { data: alertsData } = await supabase
          .from('fault_alerts')
          .select('*')
          .eq('is_acknowledged', false)
          .order('created_at', { ascending: false });
        if (alertsData) {
          setAlerts(alertsData);
        }
      }
    }
    loadInitialData();
  }, [supabase]);

  // 3. Realtime WebSocket subscription
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      return;
    }

    const channel = supabase
      .channel('scada_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'fans' },
        (payload) => {
          setFans((prev) =>
            prev.map((f) => (f.fan_id === payload.new.fan_id ? { ...f, ...(payload.new as Fan) } : f))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fault_alerts' },
        (payload) => {
          setAlerts((prev) => [payload.new as FaultAlert, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // 4. Zero-Latency Simulation Progression Engine
  const advanceTick = useCallback(() => {
    const nextCycle = cycleRef.current + 1;
    cycleRef.current = nextCycle;
    setCycle(nextCycle);

    const newFanOutputs: Record<number, any> = {};
    const chartPoint: ChartPoint = {
      step: nextCycle,
      fan1: 100,
      fan2: 90,
      fan3: 80,
      fan4: 70,
    };
    const newAlarms: FaultAlert[] = [];

    [1, 2, 3, 4].forEach((fanId) => {
      const mode = fanModes[fanId] || 'Random';
      const step = simulateFanStep(fanId, mode, source, nextCycle);
      const newStatus = step.predicted_rul < 15.0 ? 'Critical' : step.predicted_rul < 40.0 ? 'Warning' : 'Normal';

      newFanOutputs[fanId] = {
        ...step,
        status: newStatus,
      };

      if (fanId === 1) chartPoint.fan1 = step.predicted_rul;
      else if (fanId === 2) chartPoint.fan2 = step.predicted_rul;
      else if (fanId === 3) chartPoint.fan3 = step.predicted_rul;
      else if (fanId === 4) chartPoint.fan4 = step.predicted_rul;

      if (newStatus === 'Critical') {
        newAlarms.push({
          id: `alarm-${nextCycle}-${fanId}`,
          fan_id: fanId,
          alert_type: 'CRITICAL_RUL',
          severity: 'CRITICAL',
          message: `CRITICAL: Fan #${fanId} RUL dropped to ${step.predicted_rul}d! Fault: ${step.predicted_fault}`,
          is_acknowledged: false,
          created_at: new Date().toISOString(),
        });
      }
    });

    setFans((prev) =>
      prev.map((f) => {
        const out = newFanOutputs[f.fan_id];
        if (!out) return f;
        return {
          ...f,
          status: out.status,
          current_rul: out.predicted_rul,
          current_fault: out.predicted_fault,
          is_anomaly: out.is_anomaly,
          latest_speed: out.speed,
          latest_vibration: out.vibration,
          latest_temperature: out.temperature,
          latest_power: out.power,
        };
      })
    );

    setChartData((prev) => {
      const updated = [...prev, chartPoint];
      return updated.length > 25 ? updated.slice(-25) : updated;
    });

    if (newAlarms.length > 0) {
      setAlerts((prev) => [...newAlarms, ...prev.slice(0, 15)]);
    }

    // Async sync with Supabase
    fetch('/api/simulation/tick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source,
        cycle: nextCycle,
        modes: fanModes,
      }),
    }).catch(() => {});
  }, [source, fanModes]);

  // Automated Streaming Interval with dynamic Speed Control
  useEffect(() => {
    if (isStreaming) {
      streamIntervalRef.current = setInterval(advanceTick, streamSpeed);
    } else if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, [isStreaming, advanceTick, streamSpeed]);

  const handleModeChange = async (fanId: number, mode: FanMode) => {
    setFanModes((prev) => ({ ...prev, [fanId]: mode }));
    setFans((prev) =>
      prev.map((f) => (f.fan_id === fanId ? { ...f, simulation_mode: mode } : f))
    );

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      await supabase
        .from('fans')
        .update({ simulation_mode: mode })
        .eq('fan_id', fanId);
    }
    advanceTick();
  };

  // 1-Click Anomaly Trigger (Essential for Viva Demonstrations!)
  const handleInjectAnomaly = (fanId: number) => {
    handleModeChange(fanId, 'Worst');
    setAlerts((prev) => [
      {
        id: `inject-${Date.now()}-${fanId}`,
        fan_id: fanId,
        alert_type: 'CRITICAL_RUL',
        severity: 'CRITICAL',
        message: `OPERATOR FAULT INJECTION: Severe Bearing Wear & Vibration Anomaly flagged on TBF-0${fanId}!`,
        is_acknowledged: false,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // 1-Click Component Overhaul / Repair
  const handleRepairFan = (fanId: number) => {
    handleModeChange(fanId, 'Good');
  };

  // Full SCADA Maintenance Reset to Cycle 1
  const handleResetSimulation = () => {
    cycleRef.current = 1;
    setCycle(1);
    const resetModes: Record<number, FanMode> = { 1: 'Random', 2: 'Random', 3: 'Random', 4: 'Random' };
    setFanModes(resetModes);
    setAlerts([]);

    const resetFans = INITIAL_FANS.map((f) => {
      const step = simulateFanStep(f.fan_id, 'Random', source, 1);
      return {
        ...f,
        status: 'Normal' as const,
        current_rul: step.predicted_rul,
        current_fault: 'Normal',
        is_anomaly: false,
        latest_speed: step.speed,
        latest_vibration: step.vibration,
        latest_temperature: step.temperature,
        latest_power: step.power,
        simulation_mode: 'Random' as const,
      };
    });
    setFans(resetFans);

    const initialPoint: ChartPoint = {
      step: 1,
      fan1: resetFans[0].current_rul,
      fan2: resetFans[1].current_rul,
      fan3: resetFans[2].current_rul,
      fan4: resetFans[3].current_rul,
    };
    setChartData([initialPoint]);
  };

  // Viva / Presentation Quick Scenario Presets
  const applyPresetScenario = (scenario: 'HEALTHY' | 'WARNING' | 'CRITICAL_FAULT') => {
    if (scenario === 'HEALTHY') {
      cycleRef.current = 5;
      setCycle(5);
      const modes: Record<number, FanMode> = { 1: 'Good', 2: 'Good', 3: 'Good', 4: 'Good' };
      setFanModes(modes);
      setAlerts([]);
      setFans((prev) =>
        prev.map((f) => {
          const step = simulateFanStep(f.fan_id, 'Good', source, 5);
          return {
            ...f,
            status: 'Normal',
            current_rul: step.predicted_rul,
            current_fault: 'Normal',
            is_anomaly: false,
            latest_speed: step.speed,
            latest_vibration: step.vibration,
            latest_temperature: step.temperature,
            latest_power: step.power,
            simulation_mode: 'Good',
          };
        })
      );
    } else if (scenario === 'WARNING') {
      cycleRef.current = 130;
      setCycle(130);
      const modes: Record<number, FanMode> = { 1: 'Random', 2: 'Random', 3: 'Random', 4: 'Random' };
      setFanModes(modes);
      setFans((prev) =>
        prev.map((f) => {
          const step = simulateFanStep(f.fan_id, 'Random', source, 130);
          const st = step.predicted_rul < 15 ? 'Critical' : step.predicted_rul < 40 ? 'Warning' : 'Normal';
          return {
            ...f,
            status: st,
            current_rul: step.predicted_rul,
            current_fault: step.predicted_fault,
            is_anomaly: step.is_anomaly,
            latest_speed: step.speed,
            latest_vibration: step.vibration,
            latest_temperature: step.temperature,
            latest_power: step.power,
          };
        })
      );
    } else if (scenario === 'CRITICAL_FAULT') {
      const modes: Record<number, FanMode> = { 1: 'Worst', 2: 'Random', 3: 'Worst', 4: 'Random' };
      setFanModes(modes);
      const nextC = cycleRef.current;
      setFans((prev) =>
        prev.map((f) => {
          const m = modes[f.fan_id];
          const step = simulateFanStep(f.fan_id, m, source, nextC);
          const st = step.predicted_rul < 15 ? 'Critical' : step.predicted_rul < 40 ? 'Warning' : 'Normal';
          return {
            ...f,
            status: st,
            current_rul: step.predicted_rul,
            current_fault: step.predicted_fault,
            is_anomaly: step.is_anomaly,
            latest_speed: step.speed,
            latest_vibration: step.vibration,
            latest_temperature: step.temperature,
            latest_power: step.power,
            simulation_mode: m,
          };
        })
      );
      setAlerts((prev) => [
        {
          id: `crit-preset-${Date.now()}-1`,
          fan_id: 1,
          alert_type: 'CRITICAL_RUL',
          severity: 'CRITICAL',
          message: 'OPERATOR INJECTED FAULT: Severe Bearing Wear & Shaft Imbalance on TBF-01',
          is_acknowledged: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const criticalCount = fans.filter((f) => f.status === 'Critical').length;
  const warningCount = fans.filter((f) => f.status === 'Warning').length;
  const nominalCount = fans.length - criticalCount - warningCount;
  const allDegraded = criticalCount === fans.length && fans.every((f) => f.current_rul <= 2.0);

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-150">
      {/* Top SCADA Control Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded text-blue-600 dark:text-blue-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
                TUNNEL BOOSTER FAN SCADA
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                PROGNOSTICS v2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Condition-Based Monitoring & Prognostic Control Platform
            </p>
          </div>
        </div>

        {/* Telemetry Source Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded text-xs font-mono">
          <button
            onClick={() => {
              setSource('SYNTHETIC');
              cycleRef.current = 1;
              setCycle(1);
            }}
            className={`px-3 py-1.5 rounded transition cursor-pointer font-medium ${
              source === 'SYNTHETIC'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-bold shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Digital Twin Physics
          </button>
          <button
            onClick={() => {
              setSource('NASA_CMAPSS');
              cycleRef.current = 1;
              setCycle(1);
            }}
            className={`px-3 py-1.5 rounded transition cursor-pointer font-medium flex items-center gap-1.5 ${
              source === 'NASA_CMAPSS'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
            NASA C-MAPSS FD001
          </button>
        </div>

        {/* System Controls & Theme Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Stream Speed Controller */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-0.5 text-[11px] font-mono">
            <span className="px-1.5 text-slate-500 text-[10px] font-semibold">SPEED:</span>
            {[
              { label: '0.5x', ms: 3000 },
              { label: '1x', ms: 2000 },
              { label: '2x', ms: 1000 },
              { label: '5x', ms: 400 },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setStreamSpeed(s.ms)}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer text-[10px] ${
                  streamSpeed === s.ms
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Link to Project Brief & Team Landing Page */}
          <Link
            href="/"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="View Project Brief & Architecture"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-bold">PROJECT BRIEF</span>
          </Link>

          {/* Instant Theme Toggle (Light Default) */}
          <button
            onClick={toggleTheme}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Toggle Light / Dark Mode"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            <span className="text-[11px] font-bold">{isDark ? 'LIGHT' : 'DARK'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded">
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
              }`}
            ></span>
            <span className={isStreaming ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-500'}>
              {isStreaming ? 'ONLINE' : 'PAUSED'}
            </span>
          </div>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isStreaming
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isStreaming ? 'PAUSE' : 'STREAM'}
          </button>

          <button
            onClick={advanceTick}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Advance Single Cycle Step (Manual Time-Step)"
          >
            <FastForward className="w-3.5 h-3.5" />
            STEP TICK
          </button>

          {/* Maintenance Overhaul Reset Button */}
          <button
            onClick={handleResetSimulation}
            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Reset Simulation to Initial Cycle 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET
          </button>

          <button
            onClick={handleSignOut}
            className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
            title="Operator Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Run-to-Failure Overhaul Banner (Triggered when units reach 0 RUL) */}
      {allDegraded && (
        <section className="bg-amber-500/15 border-b border-amber-500/40 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>
              <strong>RUN-TO-FAILURE CYCLE COMPLETE:</strong> All 4 monitored booster units have reached end-of-life degradation limit (RUL 0.0d).
            </span>
          </div>
          <button
            onClick={handleResetSimulation}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            PERFORM SCADA OVERHAUL &amp; RESET TO CYCLE 1
          </button>
        </section>
      )}

      {/* Industrial Sub-Diagnostics Status Ribbon */}
      <section className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-4 text-slate-600 dark:text-slate-400 font-mono">
        <div className="flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            ENGINE: <strong className="text-slate-800 dark:text-slate-200">Next.js 14 Serverless</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            DATABASE: <strong className="text-emerald-700 dark:text-emerald-400">Supabase Postgres</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            TELEMETRY BUS: <strong className="text-sky-700 dark:text-sky-400">Realtime Channel</strong>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>
            ACTIVE MODE:{' '}
            <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700">
              {source === 'NASA_CMAPSS' ? 'NASA C-MAPSS FD001 (192 Cycles)' : 'SYNTHETIC DIGITAL TWIN'}
            </span>
          </span>
          <span className="text-slate-500 font-semibold">{liveTime}</span>
        </div>
      </section>

      {/* Main SCADA Workspace */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Presentation & Viva Demo Command Bar */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              VIVA &amp; PRESENTATION DEMO PRESETS:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyPresetScenario('HEALTHY')}
              className="px-3 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Set all 4 units to pristine nominal state"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Scenario 1: 100% Healthy
            </button>
            <button
              onClick={() => applyPresetScenario('WARNING')}
              className="px-3 py-1.5 rounded bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Fast-forward to cycle 130 to show incipient degradation"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Scenario 2: Incipient Wear
            </button>
            <button
              onClick={() => applyPresetScenario('CRITICAL_FAULT')}
              className="px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Inject critical shaft imbalance & bearing failure"
            >
              <Zap className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              Scenario 3: Inject Critical Anomaly
            </button>
          </div>
        </section>

        {/* KPI Overview Matrix */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-wider">
              MONITORED UNITS
            </span>
            <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100 num-telemetry">
              {fans.length}
            </div>
            <span className="text-[11px] text-slate-500">Active Ventilation Shafts</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-wider">
              NOMINAL STATUS
            </span>
            <div className="text-2xl font-bold mt-1 text-emerald-700 dark:text-emerald-400 num-telemetry">
              {nominalCount}
            </div>
            <span className="text-[11px] text-slate-500">RUL &ge; 40.0 Days Envelope</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border-l-4 border-l-amber-500 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-wider">
              WARNING THRESHOLD
            </span>
            <div className="text-2xl font-bold mt-1 text-amber-700 dark:text-amber-400 num-telemetry">
              {warningCount}
            </div>
            <span className="text-[11px] text-slate-500">15.0d &le; RUL &lt; 40.0d</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border-l-4 border-l-rose-500 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-wider">
              CRITICAL HAZARDS
            </span>
            <div className="text-2xl font-bold mt-1 text-rose-700 dark:text-rose-400 num-telemetry">
              {criticalCount}
            </div>
            <span className="text-[11px] text-slate-500">RUL &lt; 15.0d or Failure</span>
          </div>
        </section>

        {/* 4 Fan Annunciator Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fans.map((fan) => {
            const isCrit = fan.status === 'Critical';
            const isWarn = fan.status === 'Warning';

            return (
              <article
                key={fan.id || fan.fan_id}
                className={`bg-white dark:bg-slate-900 border rounded-lg p-5 flex flex-col justify-between transition-all duration-150 shadow-xs border-l-4 ${
                  isCrit
                    ? 'border-l-rose-600 border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                    : isWarn
                    ? 'border-l-amber-500 border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'border-l-emerald-600 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Card Header & Annunciator Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      TBF-0{fan.fan_id}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          isCrit
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                            : isWarn
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {fan.status.toUpperCase()}
                      </span>
                      {fan.is_anomaly && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-500 text-white animate-pulse">
                          ANOMALY
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{fan.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">{fan.location}</p>

                  {/* Primary Prognostic RUL Panel */}
                  <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded p-3 mb-3">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                      PREDICTED RUL
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span
                        className={`text-3xl font-bold num-telemetry ${
                          fan.current_rul < 15
                            ? 'text-rose-600 dark:text-rose-400'
                            : fan.current_rul < 40
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-blue-700 dark:text-sky-400'
                        }`}
                      >
                        {fan.current_rul.toFixed(1)}
                      </span>
                      <span className="text-xs font-mono text-slate-500">DAYS</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
                      <span>Diagnosed Fault:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">{fan.current_fault}</span>
                    </div>
                  </div>

                  {/* 4 Micro-Gauges Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-2 rounded">
                      <span className="text-[10px] text-slate-500 block">ROTATIONAL SPEED</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 num-telemetry">
                        {fan.latest_speed || 2450} <span className="text-[10px] text-slate-500">RPM</span>
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-2 rounded">
                      <span className="text-[10px] text-slate-500 block">BEARING VIBRATION</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 num-telemetry">
                        {fan.latest_vibration || 1.8} <span className="text-[10px] text-slate-500">mm/s</span>
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-2 rounded">
                      <span className="text-[10px] text-slate-500 block">WINDING TEMP</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 num-telemetry">
                        {fan.latest_temperature || 60.5} <span className="text-[10px] text-slate-500">°C</span>
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-2 rounded">
                      <span className="text-[10px] text-slate-500 block">POWER DRAW</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 num-telemetry">
                        {fan.latest_power || 52.0} <span className="text-[10px] text-slate-500">kW</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile & Live Anomaly Injection Controls */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 font-mono">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-slate-500 font-semibold">
                      OPERATIONAL PROFILE:
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {fanModes[fan.fan_id] || fan.simulation_mode}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    {(['Good', 'Random', 'Worst'] as const).map((m) => {
                      const isActive = (fanModes[fan.fan_id] || fan.simulation_mode) === m;
                      return (
                        <button
                          key={m}
                          onClick={() => handleModeChange(fan.fan_id, m)}
                          className={`py-1 rounded border transition cursor-pointer text-center font-bold ${
                            isActive
                              ? m === 'Worst'
                                ? 'bg-rose-600 border-rose-600 text-white shadow-2xs'
                                : m === 'Good'
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                : 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {m === 'Good' ? 'Nominal' : m === 'Random' ? 'Stochastic' : 'Accelerated'}
                        </button>
                      );
                    })}
                  </div>

                  {/* 1-Click Viva Action Shortcuts */}
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleInjectAnomaly(fan.fan_id)}
                      className="py-1 px-2 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
                      title="Inject instant bearing vibration anomaly"
                    >
                      <Zap className="w-3 h-3 text-rose-600" />
                      INJECT FAULT
                    </button>
                    <button
                      onClick={() => handleRepairFan(fan.fan_id)}
                      className="py-1 px-2 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
                      title="Perform maintenance repair and restore to nominal"
                    >
                      <Wrench className="w-3 h-3 text-emerald-600" />
                      OVERHAUL
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Analytics Deck: Vector RUL Trajectory + SOE Alarm Feed */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RULChart data={chartData} cycle={cycle} source={source} isDark={isDark} />
          </div>
          <div className="lg:col-span-1">
            <AlarmLog
              alerts={alerts}
              onAcknowledge={(id) =>
                setAlerts((prev) => prev.filter((a) => a.id !== id))
              }
              isDark={isDark}
            />
          </div>
        </section>
      </main>

      {/* Industrial Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-3.5 px-6 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap justify-between gap-2 bg-white/80 dark:bg-slate-900/60 font-mono">
        <span>PROJECT: <strong>TBF Condition-Based Monitoring &amp; Prognostics</strong></span>
        <span>INSTITUTE: <strong>Bhilai Institute of Technology Durg (B.Tech Major Batch 2021-2025)</strong></span>
        <span>LEAD ARCHITECT: <strong>Rajeev Mandle</strong></span>
      </footer>
    </div>
  );
}
