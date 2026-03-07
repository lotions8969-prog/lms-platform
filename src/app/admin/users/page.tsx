'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users, Shield, GraduationCap, ChevronRight, BookOpen, UserPlus, X, Loader2, Eye, EyeOff } from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'student';
  createdAt: string;
  progress: Record<string, { completedLessons: string[]; completed: boolean }>;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'student'>('all');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', displayName: '', role: 'student' as 'student' | 'admin' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetch('/api/users').then((r) => r.json()).then((d) => { setUsers(d); setLoading(false); });
  }, []);

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.email.toLowerCase().includes(q) || (u.displayName || '').toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  const openModal = () => {
    setForm({ email: '', password: '', displayName: '', role: 'student' });
    setFormError('');
    setShowModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (form.password.length < 6) { setFormError('パスワードは6文字以上で入力してください'); return; }
    setSubmitting(true);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setFormError(data.error || '作成に失敗しました');
      setSubmitting(false);
      return;
    }
    setUsers((prev) => [data, ...prev]);
    setShowModal(false);
    setSubmitting(false);
  };

  return (
    <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
          <p className="text-gray-500 text-sm mt-1">
            全{users.length}名 · <span className="text-gray-600">{totalStudents}名受講生</span> · <span className="text-indigo-600">{totalAdmins}名管理者</span>
          </p>
        </div>
        <button onClick={openModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm">
          <UserPlus className="w-4 h-4" />アカウント追加
        </button>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="メールアドレス・名前で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          {([
            { v: 'all', label: 'すべて' },
            { v: 'student', label: '受講生' },
            { v: 'admin', label: '管理者' },
          ] as const).map((f) => (
            <button key={f.v} onClick={() => setRoleFilter(f.v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                roleFilter === f.v
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* User table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
          <div className="col-span-4">ユーザー</div>
          <div className="col-span-2">ロール</div>
          <div className="col-span-2 hidden sm:block">登録日</div>
          <div className="col-span-2 hidden sm:block">受講状況</div>
          <div className="col-span-2"></div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 animate-pulse">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full shrink-0" />
                  <div className="h-4 bg-gray-100 rounded w-32" />
                </div>
                <div className="col-span-2"><div className="h-5 bg-gray-100 rounded w-16" /></div>
                <div className="col-span-2 hidden sm:block"><div className="h-4 bg-gray-100 rounded w-20" /></div>
                <div className="col-span-2 hidden sm:block"><div className="h-4 bg-gray-100 rounded w-16" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">ユーザーが見つかりません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((user) => {
              const enrolledCount = Object.keys(user.progress || {}).length;
              const completedCount = Object.values(user.progress || {}).filter((p) => p.completed).length;
              const initials = (user.displayName || user.email).slice(0, 2).toUpperCase();

              return (
                <div key={user.id} className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-gray-50 transition-colors items-center">
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      {user.displayName && <p className="text-sm font-medium text-gray-800 truncate">{user.displayName}</p>}
                      <p className={`truncate ${user.displayName ? 'text-xs text-gray-400' : 'text-sm text-gray-800'}`}>{user.email}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                      user.role === 'admin'
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {user.role === 'admin' ? <><Shield className="w-2.5 h-2.5" />管理者</> : <><GraduationCap className="w-2.5 h-2.5" />受講生</>}
                    </span>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString('ja-JP')}</p>
                  </div>
                  <div className="col-span-2 hidden sm:flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-gray-300 shrink-0" />
                    <span className="text-xs text-gray-500">{enrolledCount}件</span>
                    {completedCount > 0 && <span className="text-xs text-emerald-500">({completedCount}完了)</span>}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Link href={`/admin/users/${user.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                      詳細<ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />アカウントを追加
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{formError}</div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">表示名 <span className="text-gray-400 font-normal">（任意）</span></label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="山田 太郎"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">メールアドレス <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">パスワード <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      className="w-full px-3.5 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="6文字以上"
                    />
                    <button type="button" onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">アカウント種別</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ['student', '受講生', GraduationCap],
                      ['admin', '管理者', Shield],
                    ] as const).map(([v, label, Icon]) => (
                      <button key={v} type="button" onClick={() => setForm((p) => ({ ...p, role: v }))}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          form.role === v
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                        }`}>
                        <Icon className="w-4 h-4" />{label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    キャンセル
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />作成中...</> : <>アカウント作成</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
