'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, FileCheck, Clock, ChevronRight, ArrowUpRight, Eye, EyeOff, TrendingUp, Activity } from 'lucide-react';
import type { Course, Submission } from '@/lib/types';

interface UserStat {
  userId: string;
  email: string;
  displayName?: string;
  createdAt: string;
  enrolledCourses: number;
  completedCourses: number;
  totalLessonsDone: number;
}

interface ReportData {
  totalStudents: number;
  activeStudents: number;
  totalCompletions: number;
  courseStats: { courseId: string; title: string; enrolled: number; completed: number; completionRate: number }[];
  userStats: UserStat[];
}

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/courses').then((r) => r.json()),
      fetch('/api/submissions').then((r) => r.json()),
      fetch('/api/reports').then((r) => r.json()),
    ]).then(([c, s, rep]) => {
      setCourses(c);
      setSubmissions(s);
      setReport(rep);
      setLoading(false);
    });
  }, []);

  const pending = submissions.filter((s) => s.status === 'pending').length;
  const published = courses.filter((c) => c.published !== false).length;

  const stats = [
    {
      label: '受講生',
      value: report?.totalStudents ?? '—',
      sub: `${report?.activeStudents ?? 0}名アクティブ`,
      icon: Users,
      href: '/admin/users',
      color: 'violet',
    },
    {
      label: '公開コース',
      value: published,
      sub: `全${courses.length}件中`,
      icon: BookOpen,
      href: '/admin/courses',
      color: 'blue',
    },
    {
      label: 'コース完了数',
      value: report?.totalCompletions ?? '—',
      sub: '累計',
      icon: TrendingUp,
      href: '/admin/reports',
      color: 'emerald',
    },
    {
      label: 'レビュー待ち',
      value: pending,
      sub: '未処理の提出物',
      icon: Clock,
      href: '/admin/submissions',
      color: pending > 0 ? 'rose' : 'zinc',
    },
  ];

  const colorMap: Record<string, { num: string; bg: string; icon: string }> = {
    violet: { num: 'text-violet-400', bg: 'bg-violet-500/10', icon: 'text-violet-400' },
    blue:   { num: 'text-blue-400',   bg: 'bg-blue-500/10',   icon: 'text-blue-400' },
    emerald:{ num: 'text-emerald-400',bg: 'bg-emerald-500/10',icon: 'text-emerald-400' },
    rose:   { num: 'text-rose-400',   bg: 'bg-rose-500/10',   icon: 'text-rose-400' },
    zinc:   { num: 'text-zinc-400',   bg: 'bg-zinc-700/30',   icon: 'text-zinc-400' },
  };

  // Simple bar chart data
  const chartData = report?.courseStats.slice(0, 6) || [];
  const maxEnrolled = Math.max(...chartData.map((c) => c.enrolled), 1);

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">ダッシュボード</h1>
        <p className="text-zinc-500 text-sm mt-1">ENISHI LESSONS の管理パネル</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => {
          const c = colorMap[s.color];
          return (
            <Link key={s.label} href={s.href}>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all group cursor-pointer">
                <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <s.icon className={`w-4 h-4 ${c.icon}`} />
                </div>
                {loading
                  ? <div className="h-7 bg-zinc-800 animate-pulse rounded-lg w-12 mb-1" />
                  : <p className={`text-3xl font-bold ${c.num}`}>{s.value}</p>
                }
                <p className="text-xs text-zinc-600 mt-0.5">{s.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Course enrollment chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white text-sm">コース別受講状況</h2>
            <Link href="/admin/reports" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">詳細 →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-zinc-800 rounded-lg animate-pulse" />)}
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-sm">データがありません</div>
          ) : (
            <div className="space-y-3">
              {chartData.map((c) => (
                <div key={c.courseId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400 truncate max-w-[60%]">{c.title}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-zinc-600">{c.enrolled}名受講</span>
                      <span className="text-xs font-semibold text-violet-400">{c.completionRate}%完了</span>
                    </div>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-700 rounded-full relative">
                      <div
                        className="absolute left-0 top-0 h-full bg-violet-500 rounded-full transition-all"
                        style={{ width: `${maxEnrolled > 0 ? (c.enrolled / maxEnrolled) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${c.completionRate}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-violet-500 rounded-sm" /><span className="text-[10px] text-zinc-600">受講者数</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /><span className="text-[10px] text-zinc-600">完了率</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white text-sm mb-4">クイックアクション</h2>
          <div className="space-y-2">
            {[
              { href: '/admin/courses/new', label: 'コースを作成', icon: BookOpen, color: 'violet' },
              { href: '/admin/users', label: 'ユーザー管理', icon: Users, color: 'blue' },
              { href: '/admin/surveys/new', label: 'アンケートを作成', icon: Activity, color: 'emerald' },
              { href: '/admin/submissions', label: '提出物レビュー', icon: FileCheck, color: pending > 0 ? 'rose' : 'zinc' },
            ].map((a) => {
              const c = colorMap[a.color];
              return (
                <Link key={a.href} href={a.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors group">
                  <div className={`w-7 h-7 ${c.bg} rounded-lg flex items-center justify-center`}>
                    <a.icon className={`w-3.5 h-3.5 ${c.icon}`} />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{a.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 ml-auto transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white text-sm">最近の提出物</h2>
          <Link href="/admin/submissions" className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">すべて見る →</Link>
        </div>
        {loading ? (
          <div className="divide-y divide-zinc-800">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 px-5 py-3 flex items-center"><div className="h-4 bg-zinc-800 rounded animate-pulse w-48" /></div>)}
          </div>
        ) : submissions.length === 0 ? (
          <div className="px-5 py-8 text-center text-zinc-600 text-sm">提出物がありません</div>
        ) : (
          <div>
            {submissions.slice(0, 5).map((sub, i) => (
              <div key={sub.id} className={`flex items-center justify-between px-5 py-3 hover:bg-zinc-800/50 transition-colors ${i < 4 ? 'border-b border-zinc-800/60' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    sub.status === 'pending' ? 'bg-amber-400' :
                    sub.status === 'approved' ? 'bg-emerald-400' : 'bg-zinc-600'
                  }`} />
                  <p className="text-xs text-zinc-400 truncate">{new Date(sub.createdAt).toLocaleDateString('ja-JP')}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  sub.status === 'pending' ? 'bg-amber-900/30 text-amber-400' :
                  sub.status === 'approved' ? 'bg-emerald-900/30 text-emerald-400' :
                  'bg-zinc-800 text-zinc-500'
                }`}>
                  {sub.status === 'pending' ? 'レビュー待ち' : sub.status === 'approved' ? '承認済み' : '要再提出'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course list */}
      {courses.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h2 className="font-semibold text-white text-sm">コース一覧</h2>
            <Link href="/admin/courses" className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors flex items-center gap-1">
              管理する <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {courses.slice(0, 5).map((course, i) => (
              <div key={course.id} className={`flex items-center justify-between px-5 py-3.5 hover:bg-zinc-800/50 transition-colors ${i < courses.length - 1 ? 'border-b border-zinc-800/60' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-200 text-sm truncate">{course.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {course.published !== false
                        ? <span className="flex items-center gap-0.5 text-[10px] text-emerald-500"><Eye className="w-2.5 h-2.5" />公開中</span>
                        : <span className="flex items-center gap-0.5 text-[10px] text-zinc-600"><EyeOff className="w-2.5 h-2.5" />下書き</span>
                      }
                    </div>
                  </div>
                </div>
                <Link href={`/admin/courses/${course.id}/lessons`}
                  className="text-[11px] px-2.5 py-1.5 text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors shrink-0">
                  管理
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
