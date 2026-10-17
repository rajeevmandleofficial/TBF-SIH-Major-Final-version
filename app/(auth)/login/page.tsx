'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ShieldAlert, KeyRound, Mail, ArrowRight, Activity } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // If placeholder keys, allow direct bypass to dashboard for demoing
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      router.push('/');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const bypassDemo = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 font-mono text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded text-blue-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-slate-100">TBF SCADA PORTAL</h1>
            <p className="text-xs text-slate-400">Operator Authentication Gate</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 text-xs bg-red-950/50 border border-red-500/50 text-red-300 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">ENGINEER EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@transit-scada.org"
                className="w-full bg-slate-950 border border-slate-800 rounded py-2.5 pl-10 pr-3 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">SECURITY ACCESS KEY</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded py-2.5 pl-10 pr-3 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'AUTHENTICATING...' : 'SECURE SIGN IN'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2 text-center text-xs text-slate-400">
          <button
            type="button"
            onClick={bypassDemo}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-750 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            ENTER LIVE DEMO CONTROL ROOM
          </button>

          <p className="mt-2 text-slate-400">
            First time on duty?{' '}
            <Link href="/signup" className="text-blue-400 hover:underline">
              Register Operator Key
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
