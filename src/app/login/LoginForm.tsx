'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

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
      const from = searchParams.get('from') || '/courses';
      router.replace(from);
    } catch {
      setError('メールアドレスまたはパスワードが正しくありません');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl">UMULMS</span>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            学びを加速する<br />ラーニングプラットフォーム
          </h2>
          <p className="text-indigo-200 text-base leading-relaxed">
            動画レッスン・クイズ・アウトプット録画で<br />
            効果的なスキルアップを実現します。
          </p>
          <div className="flex gap-8 mt-8">
            <div>
              <p className="text-2xl font-bold text-white">動画</p>
              <p className="text-indigo-200 text-sm">レッスン</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">クイズ</p>
              <p className="text-indigo-200 text-sm">理解確認</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">録画</p>
              <p className="text-indigo-200 text-sm">アウトプット</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-indigo-300 text-xs">© 2025 UMULMS Platform</div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-xl">UMULMS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">おかえりなさい</h1>
            <p className="text-slate-500 mt-1">アカウントにサインインしてください</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">メールアドレス</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                    placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">パスワード</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                    placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'サインイン中...' : 'サインイン'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                デモアカウント: <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">admin@lms.test</span> / <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">admin123</span>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            アカウントをお持ちでない方は{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
