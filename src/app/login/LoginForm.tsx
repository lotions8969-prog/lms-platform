'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace(searchParams.get('from') || '/courses');
    } catch {
      setError('メールアドレスまたはパスワードが正しくありません');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/50">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            ENISHI <span className="text-violet-400">LESSONS</span>
          </span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">おかえりなさい</h1>
          <p className="text-zinc-500 text-sm mt-1">アカウントにサインインしてください</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-950/60 border border-red-900 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">メールアドレス</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">パスワード</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/30 hover:shadow-violet-800/40 disabled:opacity-50 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'サインイン中...' : 'サインイン'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-zinc-800">
            <p className="text-xs text-zinc-600 mb-2">デモアカウント</p>
            <div className="space-y-1.5">
              {[['admin@lms.test', 'admin123', '管理者'], ['student@lms.test', 'student123', '受講生']].map(([e, p, r]) => (
                <button key={e} type="button" onClick={() => { setEmail(e); setPassword(p); }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800/60 hover:bg-zinc-800 rounded-lg transition-colors group">
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-300 font-mono">{e}</span>
                  <span className="text-[10px] bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">{r}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-600 mt-6">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">新規登録</Link>
        </p>
      </div>
    </div>
  );
}
