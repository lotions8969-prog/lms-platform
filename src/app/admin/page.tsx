'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { BookOpen, Users, FileVideo, Clock, ChevronRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Course, Submission } from '@/lib/types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/courses').then((r) => r.json()),
      fetch('/api/submissions').then((r) => r.json()),
    ]).then(([c, s]) => {
      setCourses(c);
      setSubmissions(s);
      setLoading(false);
    });
  }, []);

  const pending = submissions.filter((s) => s.status === 'pending').length;
  const approved = submissions.filter((s) => s.status === 'approved').length;

  const stats = [
    { label: 'コース', value: courses.length, icon: BookOpen, color: 'indigo', href: '/admin/courses', desc: '公開中のコース' },
    { label: '提出物', value: submissions.length, icon: FileVideo, color: 'violet', href: '/admin/submissions', desc: '累計提出数' },
    { label: 'レビュー待ち', value: pending, icon: Clock, color: 'amber', href: '/admin/submissions', desc: '未レビューの提出物' },
    { label: '承認済み', value: approved, icon: CheckCircle2, color: 'emerald', href: '/admin/submissions', desc: '承認した提出物' },
  ];

  const colorMap: Record<string, { bg: string; icon: string; text: string; border: string }> = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', text: 'text-indigo-700', border: 'border-indigo-100' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', text: 'text-violet-700', border: 'border-violet-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-700', border: 'border-amber-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-700', border: 'border-emerald-100' },
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-slate-500 text-sm mb-1">{greeting}👋</p>
          <h1 className="text-2xl font-bold text-slate-900">管理者ダッシュボード</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => {
            const c = colorMap[s.color];
            return (
              <Link key={s.label} href={s.href}>
                <div className={`bg-white rounded-2xl border ${c.border} p-5 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer`}>
                  <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <s.icon className={`w-5 h-5 ${c.icon}`} />
                  </div>
                  {loading
                    ? <div className="h-8 bg-slate-100 animate-pulse rounded-lg w-12 mb-1" />
                    : <p className={`text-3xl font-bold ${c.text}`}>{s.value}</p>
                  }
                  <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/admin/courses" className="group bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <BookOpen className="w-8 h-8 text-indigo-200 mb-3" />
                <h3 className="font-bold text-lg">コース管理</h3>
                <p className="text-indigo-200 text-sm mt-1">コースの作成・レッスン追加・動画管理</p>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link href="/admin/submissions" className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-8 h-8 text-violet-500" />
                  {pending > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pending}件待ち</span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-slate-900">提出物レビュー</h3>
                <p className="text-slate-500 text-sm mt-1">受講生の録画提出にフィードバックを提供</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Recent courses */}
        {courses.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />コース一覧
              </h2>
              <Link href="/admin/courses" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">すべて見る →</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{course.title}</p>
                      <p className="text-xs text-slate-400">{new Date(course.createdAt).toLocaleDateString('ja-JP')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/courses/${course.id}`} className="text-xs px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors">
                      プレビュー
                    </Link>
                    <Link href={`/admin/courses/${course.id}/lessons`} className="text-xs px-3 py-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors">
                      管理
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
