'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, ArrowRight, Loader2, BookOpen, Settings } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            ENISHI <span className="text-violet-600">LESSONS</span>
          </span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">アカウントを作成</h1>
          <p className="text-gray-500 text-sm mt-1">今すぐ学習を始めましょう</p>
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
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">パスワード <span className="text-gray-400 font-normal">（6文字以上）</span></label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">パスワード（確認）</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="••••••••" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">アカウント種別</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['student', '受講生', BookOpen, '動画・クイズで学習'],
                  ['admin', '管理者', Settings, 'コースを作成・管理'],
                ] as const).map(([v, label, Icon, desc]) => (
                  <button key={v} type="button" onClick={() => setRole(v)}
                    className={`flex flex-col items-start p-3 rounded-lg border transition-all text-left ${
                      role === v ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${role === v ? 'text-violet-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-semibold ${role === v ? 'text-violet-700' : 'text-gray-600'}`}>{label}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? '作成中...' : 'アカウントを作成'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">ログイン</Link>
        </p>
      </div>
    </div>
  );
}
