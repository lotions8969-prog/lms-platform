'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users, Shield, GraduationCap, ChevronRight, BookOpen } from 'lucide-react';

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

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">ユーザー管理</h1>
        <p className="text-zinc-500 text-sm mt-1">
          全{users.length}名 · <span className="text-zinc-400">{totalStudents}名受講生</span> · <span className="text-violet-400">{totalAdmins}名管理者</span>
        </p>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            placeholder="メールアドレス・名前で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          {([
            { v: 'all', label: 'すべて' },
            { v: 'student', label: '受講生' },
            { v: 'admin', label: '管理者' },
          ] as const).map((f) => (
            <button key={f.v} onClick={() => setRoleFilter(f.v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                roleFilter === f.v ? 'bg-violet-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* User table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-zinc-800 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
          <div className="col-span-4">ユーザー</div>
          <div className="col-span-2">ロール</div>
          <div className="col-span-2 hidden sm:block">登録日</div>
          <div className="col-span-2 hidden sm:block">受講状況</div>
          <div className="col-span-2"></div>
        </div>

        {loading ? (
          <div className="divide-y divide-zinc-800/50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 animate-pulse">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-800 rounded-full shrink-0" />
                  <div className="h-4 bg-zinc-800 rounded w-32" />
                </div>
                <div className="col-span-2"><div className="h-5 bg-zinc-800 rounded w-16" /></div>
                <div className="col-span-2 hidden sm:block"><div className="h-4 bg-zinc-800 rounded w-20" /></div>
                <div className="col-span-2 hidden sm:block"><div className="h-4 bg-zinc-800 rounded w-16" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">ユーザーが見つかりません</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {filtered.map((user) => {
              const enrolledCount = Object.keys(user.progress || {}).length;
              const completedCount = Object.values(user.progress || {}).filter((p) => p.completed).length;
              const initials = (user.displayName || user.email).slice(0, 2).toUpperCase();

              return (
                <div key={user.id} className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors items-center">
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      user.role === 'admin' ? 'bg-violet-700 text-white' : 'bg-zinc-700 text-zinc-200'
                    }`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      {user.displayName && <p className="text-sm font-medium text-zinc-200 truncate">{user.displayName}</p>}
                      <p className={`truncate ${user.displayName ? 'text-xs text-zinc-500' : 'text-sm text-zinc-200'}`}>{user.email}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                      user.role === 'admin'
                        ? 'bg-violet-900/40 text-violet-300 border-violet-800/50'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {user.role === 'admin' ? <><Shield className="w-2.5 h-2.5" />管理者</> : <><GraduationCap className="w-2.5 h-2.5" />受講生</>}
                    </span>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <p className="text-xs text-zinc-500">{new Date(user.createdAt).toLocaleDateString('ja-JP')}</p>
                  </div>
                  <div className="col-span-2 hidden sm:flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-zinc-600 shrink-0" />
                    <span className="text-xs text-zinc-500">{enrolledCount}件</span>
                    {completedCount > 0 && <span className="text-xs text-emerald-500">({completedCount}完了)</span>}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Link href={`/admin/users/${user.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors">
                      詳細<ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
