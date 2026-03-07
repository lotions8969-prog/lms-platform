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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            ENISHI <span className="text-violet-600">LESSONS</span>
          </span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">おかえりなさい</h1>
          <p className="text-gray-500 text-sm mt-1">アカウントにサインインしてください</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">メールアドレス</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">パスワード</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'サインイン中...' : 'サインイン'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">デモアカウント</p>
            <div className="space-y-1.5">
              {[['admin@lms.test', 'admin123', '管理者'], ['student@lms.test', 'student123', '受講生']].map(([e, p, r]) => (
                <button key={e} type="button" onClick={() => { setEmail(e); setPassword(p); }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group border border-gray-100">
                  <span className="text-xs text-gray-500 group-hover:text-gray-700 font-mono">{e}</span>
                  <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">{r}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">新規登録</Link>
        </p>
      </div>
    </div>
  );
}
