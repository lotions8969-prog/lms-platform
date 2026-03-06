'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Mail, Lock, UserCircle, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('パスワードが一致しません'); return; }
    if (password.length < 6) { setError('パスワードは6文字以上で入力してください'); return; }
    setLoading(true);
    try {
      await register(email, password, role);
      router.replace(role === 'admin' ? '/admin' : '/courses');
    } catch {
      setError('登録に失敗しました。別のメールアドレスをお試しください');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-100 to-indigo-50">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-xl">UMU<span className="text-indigo-600">LMS</span></span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-7">
            <h1 className="text-xl font-bold text-slate-900">アカウントを作成</h1>
            <p className="text-slate-500 text-sm mt-1">今すぐ学習を始めましょう</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">パスワード <span className="text-slate-400 font-normal text-xs">（6文字以上）</span></label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                  placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">パスワード（確認）</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                  placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">アカウント種別</label>
              <div className="grid grid-cols-2 gap-3">
                {([['student', '受講生', '動画・クイズで学習'], ['admin', '管理者', 'コース・提出物を管理']] as const).map(([v, label, desc]) => (
                  <button key={v} type="button" onClick={() => setRole(v)}
                    className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${role === v ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {role === v ? <CheckCircle className="w-3.5 h-3.5 text-indigo-600" /> : <UserCircle className="w-3.5 h-3.5 text-slate-400" />}
                      <span className={`text-sm font-semibold ${role === v ? 'text-indigo-700' : 'text-slate-700'}`}>{label}</span>
                    </div>
                    <span className="text-xs text-slate-500">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-60 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? '登録中...' : 'アカウントを作成'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">ログイン</Link>
        </p>
      </div>
    </div>
  );
}
