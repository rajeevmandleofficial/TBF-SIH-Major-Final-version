'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Mail, KeyRound, UserCheck } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setMessage(null);

    // If placeholder keys
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      setMessage('Demo mode: Supabase keys not connected. You can log in directly!');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setMessage('Registration successful! Redirecting to sign in...');
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 font-mono text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-600/20 border border-emerald-500/30 rounded text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-slate-100">OPERATOR ONBOARDING</h1>
            <p className="text-xs text-slate-400">Provision New SCADA Credentials</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 text-xs bg-red-950/50 border border-red-500/50 text-red-300 rounded">
            {errorMsg}
          </div>
        )}

        {message && (
          <div className="mb-5 p-3 text-xs bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">OFFICIAL EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rajeev@bitdurg.ac.in"
                className="w-full bg-slate-950 border border-slate-800 rounded py-2.5 pl-10 pr-3 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">CREATE MASTER KEY (Min 6 chars)</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded py-2.5 pl-10 pr-3 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'CREATING ACCOUNT...' : 'PROVISION ACCESS'}
            <UserCheck className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Access Login Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
