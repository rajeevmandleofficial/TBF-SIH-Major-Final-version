'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Radio,
  ArrowRight,
  Sun,
  Moon,
  Server,
  Database,
  Wifi,
  Shield,
  Activity,
  Layers,
  Cpu,
  Terminal,
  Zap,
  Clock,
  Award,
  ChevronDown,
  Gauge,
  CheckCircle2,
  FileCode,
  ExternalLink,
  Sliders,
  History,
  RotateCcw,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false); // DEFAULT IS LIGHT THEME!
  const [liveClock, setLiveClock] = useState('');
  const [mockCycle, setMockCycle] = useState(42);

  // Interactive Features States
  const [selectedUnit, setSelectedUnit] = useState<number>(1);
  const [terminalFaultActive, setTerminalFaultActive] = useState<boolean>(false);
  const [interactiveVib, setInteractiveVib] = useState<number>(1.85);

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

  // Live Clock & Ticker
  useEffect(() => {
    setLiveClock(new Date().toLocaleTimeString());
    const t = setInterval(() => {
      setLiveClock(new Date().toLocaleTimeString());
    }, 1000);

    const c = setInterval(() => {
      setMockCycle((prev) => (prev >= 192 ? 1 : prev + 1));
    }, 2500);

    return () => {
      clearInterval(t);
      clearInterval(c);
    };
  }, []);

  // Interactive RUL Calculator Formulation
  const calculatedRul = Math.max(
    3.0,
    Number((terminalFaultActive ? 7.5 : Math.max(0, (7.5 - interactiveVib) * 31.5)).toFixed(1))
  );
  const calculatedStatus =
    calculatedRul < 15.0 ? 'CRITICAL' : calculatedRul < 40.0 ? 'WARNING' : 'NOMINAL';
  const calculatedFault =
    calculatedRul < 15.0
      ? 'Severe Bearing Wear'
      : calculatedRul < 40.0
      ? 'Blade Aero-Damage'
      : 'Healthy (Normal Operation)';

  // Telemetry data for the 4 units in interactive terminal
  const unitProfiles: Record<number, { name: string; zone: string; baseRpm: number; baseTemp: number; baseKw: number }> = {
    1: { name: 'TBF-01', zone: 'Zone A • Portal Ch. 1000', baseRpm: 9850, baseTemp: 55.4, baseKw: 49.2 },
    2: { name: 'TBF-02', zone: 'Zone B • Portal Ch. 2000', baseRpm: 9310, baseTemp: 58.2, baseKw: 51.5 },
    3: { name: 'TBF-03', zone: 'Zone C • Portal Ch. 3000', baseRpm: 9190, baseTemp: 61.5, baseKw: 53.0 },
    4: { name: 'TBF-04', zone: 'Zone D • Portal Ch. 4000', baseRpm: 9340, baseTemp: 63.8, baseKw: 54.2 },
  };

  const currentUnit = unitProfiles[selectedUnit] || unitProfiles[1];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-mono transition-colors duration-150 flex flex-col">
      {/* Top SCADA Navigation Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-6 py-3.5 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded text-blue-600 dark:text-blue-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
                  TBF-PHM // SCADA
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  BATCH 2021-2025
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                B.Tech Major Project • Bhilai Institute of Technology Durg
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3 text-xs">
            <a
              href="#overview"
              className="px-2.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-semibold"
            >
              Overview
            </a>
            <a
              href="#interactive-demo"
              className="px-2.5 py-1.5 text-blue-600 dark:text-blue-400 hover:underline transition font-bold"
            >
              Live Demo
            </a>
            <a
              href="#evolution"
              className="px-2.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-semibold hidden md:inline-block"
            >
              Pedigree &amp; Evolution
            </a>
            <a
              href="#architecture"
              className="px-2.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-semibold"
            >
              Architecture
            </a>

            {/* Instant Theme Toggle (Light Default) */}
            <button
              onClick={toggleTheme}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ml-1"
              title="Toggle Light / Dark Mode"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              <span className="text-[11px] font-bold">{isDark ? 'LIGHT' : 'DARK'}</span>
            </button>

            {/* Direct Launch CTA */}
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer ml-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>LIVE SCADA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Industrial Sub-Diagnostics Status Ribbon */}
      <section className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-4 text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              STATUS: <strong className="text-emerald-700 dark:text-emerald-400">TELEMETRY NOMINAL</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              EDITION: <strong className="text-slate-800 dark:text-slate-200">v2.0 (2026 Production)</strong>
            </span>
            <span className="flex items-center gap-1.5 hidden lg:flex">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              PEDIGREE: <strong className="text-amber-700 dark:text-amber-300">SIH 2024 Grand Finale (DMRC)</strong>
            </span>
            <span className="flex items-center gap-1.5 hidden md:flex">
              <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              STORAGE: <strong className="text-purple-700 dark:text-purple-300">Supabase Postgres</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>ACADEMIC BATCH: <strong>BIT Durg (2021-2025)</strong></span>
            <span className="text-slate-400 font-semibold">{liveClock}</span>
          </div>
        </div>
      </section>

      {/* Hero Section: Big Technical Font, Authoritative CAD Aesthetic */}
      <section className="relative px-6 pt-14 pb-18 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Subtle CAD Blueprint Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* Glowing Linear/Vercel-style Pedigree Pill */}
            <div className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300
              bg-amber-500/10 hover:bg-amber-500/15 text-amber-900 dark:text-amber-200 
              border border-amber-500/30 dark:border-amber-400/35 
              shadow-[0_0_15px_rgba(245,158,11,0.15)] dark:shadow-[0_0_20px_rgba(245,158,11,0.22)] backdrop-blur">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="tracking-tight font-medium">
                🏆 v2.0 Successor to our SIH 2024 Grand Finale Architecture (Built for DMRC)
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-bold">
              <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>BIT Durg • Batch 2021-2025</span>
            </div>
          </div>

          <div className="space-y-4 max-w-5xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 uppercase leading-none">
              TUNNEL BOOSTER FAN <br />
              <span className="text-blue-600 dark:text-blue-400">PROGNOSTICS &amp; SCADA</span> DIGITAL TWIN
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
              An enterprise-grade Condition-Based Monitoring (CBM) and Prognostic Health Management (PHM) platform.
              Fuses high-frequency vibration spectral analysis, thermal signatures, and authentic
              <strong> NASA C-MAPSS FD001</strong> run-to-failure degradation modeling to forecast Remaining Useful Life (RUL)
              prior to catastrophic mechanical shaft seizure.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>LAUNCH LIVE SCADA CONTROL ROOM</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#interactive-demo"
              className="px-5 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded font-bold text-sm transition flex items-center gap-2 shadow-2xs"
            >
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>INTERACTIVE RUL CALCULATOR</span>
            </a>

            <a
              href="#architecture"
              className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded font-bold text-sm transition flex items-center gap-2 shadow-2xs"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>SYSTEM ARCHITECTURE</span>
            </a>
          </div>

          {/* Interactive Feature 1: Live Interactive Telemetry Unit Selector */}
          <div className="mt-8 bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-lg p-5 shadow-xl text-slate-300 text-xs">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">INTERACTIVE_SCADA_SNIFFER</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                  LIVE 2000ms SAMPLING
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden sm:inline">SELECT UNIT TO INSPECT:</span>
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded border border-slate-700">
                  {[1, 2, 3, 4].map((id) => (
                    <button
                      key={id}
                      onClick={() => setSelectedUnit(id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                        selectedUnit === id
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      TBF-0{id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Unit Telemetry Inspection Terminal */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-800/70 rounded border border-slate-700">
                <span className="text-[10px] text-slate-400 block mb-0.5">MONITORED ASSET</span>
                <div className="font-bold text-white text-sm">{currentUnit.name}</div>
                <div className="text-[11px] text-slate-400">{currentUnit.zone}</div>
              </div>

              <div className="p-3 bg-slate-800/70 rounded border border-slate-700">
                <span className="text-[10px] text-slate-400 block mb-0.5">PREDICTED RUL</span>
                <div className={`text-base font-bold ${terminalFaultActive ? 'text-rose-400 animate-pulse' : 'text-sky-400'}`}>
                  {terminalFaultActive ? '7.5 DAYS' : `${(192 - (mockCycle % 192) - selectedUnit * 4).toFixed(1)} DAYS`}
                </div>
                <span className={`text-[10px] font-bold ${terminalFaultActive ? 'text-rose-400' : 'text-emerald-400'}`}>
                  STATUS: {terminalFaultActive ? 'CRITICAL HAZARD' : 'NOMINAL ENVELOPE'}
                </span>
              </div>

              <div className="p-3 bg-slate-800/70 rounded border border-slate-700">
                <span className="text-[10px] text-slate-400 block mb-0.5">VIBRATION &amp; SPEED</span>
                <div className="font-bold text-slate-200">
                  {terminalFaultActive ? '7.65 mm/s' : `${(1.25 + selectedUnit * 0.15 + (mockCycle % 192) * 0.02).toFixed(2)} mm/s`}
                </div>
                <div className="text-[11px] text-slate-400">
                  {terminalFaultActive ? '8120 RPM' : `${currentUnit.baseRpm - (mockCycle % 192) * 6} RPM`}
                </div>
              </div>

              <div className="p-3 bg-slate-800/70 rounded border border-slate-700 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 block mb-1">INTERACTIVE INJECTION</span>
                <button
                  onClick={() => setTerminalFaultActive(!terminalFaultActive)}
                  className={`w-full py-1.5 px-2 rounded text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                    terminalFaultActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  {terminalFaultActive ? 'RESTORE BASELINE' : 'TEST ANOMALY SPIKE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Project Overview & Core Mission */}
      <section id="overview" className="py-16 px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              [ SECTION 01 // PROBLEM STATEMENT &amp; OBJECTIVES ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">
              Why Condition-Based Prognostics for Tunnel Booster Fans?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-xs">
              <div className="w-10 h-10 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800 flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-2">
                The Cost of Unscheduled Seizure
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tunnel booster fans circulate toxic vehicular exhaust (CO, NOx) and smoke during vehicle fires.
                A sudden bearing collapse or blade rupture shuts down traffic tubes, costing thousands of dollars per hour
                and posing critical life-safety hazards.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-xs">
              <div className="w-10 h-10 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-2">
                Archaic Calendar Maintenance Fails
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Traditional time-based servicing either replaces healthy parts prematurely (wasting operational budgets)
                or fails to detect dynamic mechanical fatigue that develops rapidly between inspection intervals.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg shadow-xs">
              <div className="w-10 h-10 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-2">
                Predictive RUL &amp; Digital Twin
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                By fusing piezoelectric vibration metrics, thermal signatures, and run-to-failure machine learning,
                our SCADA platform delivers continuous Remaining Useful Life (RUL) estimation with 15-day and 40-day
                warning thresholds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature 2: Interactive RUL Mathematical Estimator */}
      <section id="interactive-demo" className="py-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              [ INTERACTIVE PROGNOSTIC CALCULATOR // LIVE THRESHOLD SIMULATOR ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">
              Test Mathematical RUL Degradation In Real Time
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Drag the bearing vibration slider below to see how our multi-tier inference engine dynamically calculates Remaining Useful Life (RUL).
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">INPUT SENSOR PARAMETER:</span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Bearing Vibration (RMS): <strong className="text-blue-600 dark:text-blue-400">{interactiveVib} mm/s</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInteractiveVib(1.2)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Nominal (1.2 mm/s)
                </button>
                <button
                  onClick={() => setInteractiveVib(3.5)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Warning (3.5 mm/s)
                </button>
                <button
                  onClick={() => setInteractiveVib(6.8)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Critical (6.8 mm/s)
                </button>
              </div>
            </div>

            {/* Vibration Slider */}
            <div>
              <input
                type="range"
                min="0.8"
                max="7.8"
                step="0.05"
                value={interactiveVib}
                onChange={(e) => setInteractiveVib(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0.8 mm/s (Pristine Component)</span>
                <span>3.8 mm/s (Warning Threshold)</span>
                <span>7.8 mm/s (Imminent Mechanical Seizure)</span>
              </div>
            </div>

            {/* Calculated Output Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold block mb-1">INFERRED RUL</span>
                <div className={`text-3xl font-extrabold ${calculatedStatus === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' : calculatedStatus === 'WARNING' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-sky-400'}`}>
                  {calculatedRul} <span className="text-xs font-mono text-slate-500">DAYS</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold block mb-1">HEALTH CLASSIFICATION</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                    calculatedStatus === 'CRITICAL'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      : calculatedStatus === 'WARNING'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  }`}>
                    {calculatedStatus}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold block mb-1">DIAGNOSED FAULT MODE</span>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {calculatedFault}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: The Evolution / Pedigree (Modern SaaS 2-Column Comparison) */}
      <section id="evolution" className="py-16 px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>THE EVOLUTION &amp; NATIONAL PEDIGREE // DMRC → ENTERPRISE SCADA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              Architectural Evolution: SIH 2024 Foundation → Next-Gen Successor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Our core prognostic algorithms and vibration telemetry pipeline were selected for and demonstrated at the{' '}
              <strong>Smart India Hackathon (SIH) 2024 Grand Finale (Hardware Edition)</strong> for the{' '}
              <strong>Delhi Metro Rail Corporation (DMRC)</strong>. Validated under national-level jury evaluation, that proven 
              foundation has now evolved into this high-performance, multi-unit Serverless SCADA Digital Twin.
            </p>
          </div>

          {/* 2-Column Comparison Grid - Linear / Vercel Modern SaaS Style */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Column 1: V1.0 - The SIH 2024 Foundation */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-amber-400/50 transition duration-200">
              {/* Subtle top indicator */}
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                    <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    SIH 2024 GRAND FINALE // HARDWARE EDITION
                  </span>
                  <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                    NATIONAL BASELINE (v1.0)
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    V1.0: The SIH 2024 Foundation
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                    DMRC Tunnel Booster Fan Telemetry &amp; Fault Diagnosis
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Developed for the Delhi Metro Rail Corporation problem statement. Validated live during 36 hours of rigorous 
                  national hardware jury testing. Established the initial sensor Kurtosis bounds, vibration frequency analysis, 
                  and condition-monitoring telemetry pipeline under transit subway environmental conditions.
                </p>

                {/* Specs Matrix */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 font-mono text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Target Organization</span>
                    <strong className="text-slate-800 dark:text-slate-200">Delhi Metro (DMRC)</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Validation Level</span>
                    <strong className="text-amber-700 dark:text-amber-300">SIH Grand Finale Finalist</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Monitored Assets</span>
                    <strong className="text-slate-800 dark:text-slate-200">Single Fan Shaft (1 Node)</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Core Architecture</span>
                    <strong className="text-slate-800 dark:text-slate-200">Django + SQLite Local</strong>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Prognostic Engine</span>
                    <strong className="text-slate-800 dark:text-slate-200">Basic Kurtosis Anomaly ML</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Proof-of-Concept Hardware Demo</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">March 2025 Prototype</span>
              </div>
            </div>

            {/* Column 2: V2.0 - The Next-Gen Successor */}
            <div className="bg-white dark:bg-slate-900 border-2 border-blue-500/40 dark:border-blue-400/40 rounded-xl p-6 sm:p-8 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-blue-500 transition duration-200">
              {/* Subtle top indicator */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"></div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    ENTERPRISE PRODUCTION SCADA // 2026 EDITION
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    ACTIVE DEPLOYMENT
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    V2.0: The Next-Gen Successor
                  </h3>
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    The Current Upgraded, Scalable Production System
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Decoupled into a high-availability Serverless Edge architecture with Supabase BaaS. Scaled from a single-unit 
                  hackathon prototype into a multi-asset industrial SCADA Digital Twin fusing NASA C-MAPSS FD001 run-to-failure curves, 
                  pure SVG vector charting, and interactive fault injection.
                </p>

                {/* Specs Matrix */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 font-mono text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Target Scale</span>
                    <strong className="text-slate-800 dark:text-slate-200">Multi-Tunnel Network (4 Units)</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Technology Stack</span>
                    <strong className="text-blue-600 dark:text-blue-400">Next.js 14 App Router + Supabase</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Database &amp; Security</span>
                    <strong className="text-slate-800 dark:text-slate-200">PostgreSQL (RLS) + Edge APIs</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Prognostic Models</span>
                    <strong className="text-slate-800 dark:text-slate-200">NASA C-MAPSS FD001 + Physics Twin</strong>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">HMI &amp; Operator Controls</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">Vector SVG + Step Tick + Fault Sim</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Enterprise Condition-Based Maintenance</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">2026 Production Edition</span>
              </div>
            </div>
          </div>

          {/* Linear-Style Bridge Banner: National Validation -> Enterprise Production */}
          <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-xl p-5 sm:p-6 text-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0 mt-0.5">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span>National-Level Validation → Scalable Production Evolution</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                  The foundational predictive telemetry and mechanical failure models that earned selection at the{' '}
                  <strong>Smart India Hackathon 2024 Grand Finale for Delhi Metro Rail Corporation</strong> have been proven under 
                  demanding national evaluation. In v2.0, this architecture has been re-engineered from a monolithic hackathon project 
                  into an enterprise-grade, serverless SCADA platform designed for critical infrastructure.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer border border-blue-400/30"
            >
              <span>INSPECT v2.0 SCADA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Dual Simulation Engines (NASA C-MAPSS vs Digital Twin) */}
      <section id="models" className="py-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              [ SECTION 02 // DUAL TELEMETRY ENGINES ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">
              Two Integrated Physics &amp; Benchmark Data Engines
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Switchable with a single click inside the SCADA dashboard to demonstrate both theoretical validation and live IoT operation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Engine A: NASA C-MAPSS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-4 shadow-xs border-t-4 border-t-amber-500">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  GLOBAL AEROSPACE BENCHMARK
                </span>
                <span className="text-xs text-slate-500 font-mono">NASA Glenn Research Center</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                NASA C-MAPSS FD001 Engine Model
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Replays true run-to-failure degradation profiles from NASA turbofan test benches.
                Units 1 through 4 advance across their authentic physical lifespans (192, 240, 179, and 189 operational cycles).
                Sensor metrics show non-linear exponential degradation with severe blade damage and bearing wear emergence.
              </p>
              <ul className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <strong>Realistic Trajectory:</strong> Predicts RUL countdown from 192 down to 0 cycles.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <strong>High-Speed Dynamics:</strong> Telemetry around 9850 RPM with elevated thermal signatures.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <strong>Academic Validation:</strong> The international gold standard for prognostic algorithm validation.
                </li>
              </ul>
            </div>

            {/* Engine B: Digital Twin Physics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-4 shadow-xs border-t-4 border-t-blue-500">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  FIRST-PRINCIPLES PHYSICAL MODEL
                </span>
                <span className="text-xs text-slate-500 font-mono">Tunnel Ventilation Standard</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Tunnel Booster Fan Digital Twin
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                A mathematical simulation model of a heavy-duty 400V 3-phase induction motor operating at 2450 RPM.
                Models aerodynamic turbulence harmonics, Gaussian sensor jitter, stator winding thermal dissipation,
                and stochastic mechanical vibration wear.
              </p>
              <ul className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <strong>Industrial Tunnel Spec:</strong> Realistic 2420 - 2550 RPM nominal shaft speed.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <strong>Harmonic Jitter:</strong> Mathematical aerodynamic air turbulence simulation.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <strong>Fault Injection:</strong> 1-click triggers for bearing vibration anomalies and stator overheat.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Full Stack System Architecture */}
      <section id="architecture" className="py-16 px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              [ SECTION 03 // FULL STACK SERVERLESS ARCHITECTURE ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">
              End-to-End Technical Stack Breakdown
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Cpu className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Frontend Layer</h4>
              </div>
              <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <li>• <strong>Next.js 14 App Router</strong></li>
                <li>• <strong>React 19 Hooks</strong></li>
                <li>• <strong>TypeScript Strict Mode</strong></li>
                <li>• <strong>Tailwind CSS v4 Dual Theming</strong></li>
                <li>• <strong>Pure SVG Vector Charting</strong></li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Server className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Serverless Backend</h4>
              </div>
              <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <li>• <strong>Edge Route Handlers</strong></li>
                <li>• <strong>/api/simulation/tick</strong></li>
                <li>• <strong>Zero-Latency Local Engine</strong></li>
                <li>• <strong>Discrete Step-Ticker Logic</strong></li>
                <li>• <strong>Turbopack Dev Pipeline</strong></li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Database className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Database &amp; BaaS</h4>
              </div>
              <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <li>• <strong>Supabase PostgreSQL</strong></li>
                <li>• <strong>Row-Level Security (RLS)</strong></li>
                <li>• <strong>Realtime Telemetry Channel</strong></li>
                <li>• <strong>UUID Primary Keys</strong></li>
                <li>• <strong>Sequence-of-Events Alarms</strong></li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Shield className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Prognostics Engine</h4>
              </div>
              <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <li>• <strong>Remaining Useful Life (RUL)</strong></li>
                <li>• <strong>NASA C-MAPSS FD001</strong></li>
                <li>• <strong>Bearing Wear Diagnosis</strong></li>
                <li>• <strong>Blade Imbalance Detection</strong></li>
                <li>• <strong>1-Click Fault Injection</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Industrial Operational Launch CTA Banner */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-2xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Subtle Engineering Accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-500"></div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SYSTEM TERMINAL // READY FOR OPERATIONAL DEPLOYMENT
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase leading-tight max-w-3xl mx-auto">
              ENTER THE INDUSTRIAL SCADA CONTROL ROOM
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              Acquire live multi-unit IoT telemetry across 4 tunnel booster shafts, test on-demand bearing fault
              injections, and inspect real-time Remaining Useful Life (RUL) vector trajectories with zero latency.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-sm transition flex items-center gap-2.5 shadow-lg cursor-pointer border border-blue-400/40"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>LAUNCH LIVE SCADA CONSOLE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-sm transition flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>BACK TO TOP</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* National Pedigree Credibility Trust Strip (Linear / Vercel style) */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 py-5 px-6 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-2">
                <span>Core architecture validated at Smart India Hackathon 2024 Grand Finale</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold">
                  DMRC HARDWARE EDITION
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Demonstrated for Delhi Metro Rail Corporation Tunnel Ventilation • Proven under 36h national jury evaluation
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              SIH 2024 FINALIST ARCHITECTURE
            </span>
            <span className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold">
              v2.0 PRODUCTION EVOLUTION
            </span>
          </div>
        </div>
      </section>

      {/* Industrial Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-6 text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/60 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div>
            <strong className="text-slate-800 dark:text-slate-200">TUNNEL BOOSTER FAN SCADA // PROGNOSTICS v2026</strong>
            <div className="text-[11px] text-slate-400">
              Department of Computer Science &amp; Engineering • Bhilai Institute of Technology Durg (Batch 2021-2025)
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
              🏆 Direct v2.0 Successor to SIH 2024 Grand Finale Hardware Edition Architecture (Built for DMRC)
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Live Console
            </Link>
            <Link href="/login" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition">
              Operator Sign In
            </Link>
            <span className="text-slate-400">© 2025-2026 Rajeev Mandle</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
