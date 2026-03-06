'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { BookOpen, Users, FileVideo, Clock, ChevronRight, CheckCircle2, ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import type { Course, Submission } from '@/lib/types';

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/courses').then((r) => r.json()),
      fetch('/api/submissions').then((r) => r.json()),
    ]).then(([c, s]) => { setCourses(c); setSubmissions(s); setLoading(false); });
  }, []);

  const pending = submissions.filter((s) => s.status === 'pending').length;
  const published = courses.filter((c) => c.published !== false).length;

  const stats = [
    { label: 'コース', value: courses.length, sub: `${published}件公開中`, icon: BookOpen, href: '/admin/courses', accent: 'violet' },
    { label: '提出物', value: submissions.length, sub: '累計', icon: FileVideo, href: '/admin/submissions', accent: 'blue' },
    { label: 'レビュー待ち', value: pending, sub: '未処理', icon: Clock, href: '/admin/submissions', accent: pending > 0 ? 'rose' : 'zinc' },
    { label: '承認済み', value: submissions.filter((s) => s.status === 'approved').length, sub: '累計承認', icon: CheckCircle2, href: '/admin/submissions', accent: 'emerald' },
  ];

  const accentMap: Record<string, { num: string; bg: string; icon: string }> = {
    violet: { num: 'text-violet-400', bg: 'bg-violet-500/10', icon: 'text-violet-400' },
    blue:   { num: 'text-blue-400',   bg: 'bg-blue-500/10',   icon: 'text-blue-400' },
    rose:   { num: 'text-rose-400',   bg: 'bg-rose-500/10',   icon: 'text-rose-400' },
    emerald:{ num: 'text-emerald-400',bg: 'bg-emerald-500/10',icon: 'text-emerald-400' },
    zinc:   { num: 'text-zinc-400',   bg: 'bg-zinc-500/10',   icon: 'text-zinc-400' },
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white">ダッシュボード</h1>
          <p className="text-zinc-500 text-sm mt-1">ENISHI LESSONS の管理パネル</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((s) => {
            const a = accentMap[s.accent];
            return (
              <Link key={s.label} href={s.href}>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all group">
                  <div className={`w-9 h-9 ${a.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <s.icon className={`w-4.5 h-4.5 ${a.icon}`} />
                  </div>
                  {loading
                    ? <div className="h-7 bg-zinc-800 animate-pulse rounded-lg w-12 mb-1" />
                    : <p className={`text-3xl font-bold ${a.num}`}>{s.value}</p>
                  }
                  <p className="text-xs text-zinc-600 mt-0.5">{s.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          <Link href="/admin/courses" className="group bg-gradient-to-br from-violet-950 to-violet-900 border border-violet-800/50 rounded-2xl p-6 hover:border-violet-700 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <BookOpen className="w-7 h-7 text-violet-400 mb-3" />
                <h3 className="font-bold text-white text-base">コース管理</h3>
                <p className="text-violet-300/60 text-sm mt-0.5">コースの作成・編集・公開設定</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-violet-600 group-hover:text-violet-400 transition-colors" />
            </div>
          </Link>
          <Link href="/admin/submissions" className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-7 h-7 text-blue-400" />
                  {pending > 0 && <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{pending}</span>}
                </div>
                <h3 className="font-bold text-white text-base">提出物レビュー</h3>
                <p className="text-zinc-500 text-sm mt-0.5">受講生の録画にフィードバック</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
            </div>
          </Link>
        </div>

        {/* Course list */}
        {courses.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h2 className="font-semibold text-white text-sm">コース一覧</h2>
              <Link href="/admin/courses" className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">すべて見る →</Link>
            </div>
            <div>
              {courses.slice(0, 6).map((course, i) => (
                <div key={course.id} className={`flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors ${i < courses.length - 1 ? 'border-b border-zinc-800/60' : ''}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-100 text-sm truncate">{course.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {course.published !== false
                          ? <span className="flex items-center gap-1 text-[10px] text-emerald-400"><Eye className="w-2.5 h-2.5" />公開中</span>
                          : <span className="flex items-center gap-1 text-[10px] text-zinc-600"><EyeOff className="w-2.5 h-2.5" />下書き</span>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/courses/${course.id}`} className="text-[11px] px-2.5 py-1.5 text-violet-400 bg-violet-900/30 hover:bg-violet-900/50 rounded-lg font-medium transition-colors">プレビュー</Link>
                    <Link href={`/admin/courses/${course.id}/lessons`} className="text-[11px] px-2.5 py-1.5 text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors">管理</Link>
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
