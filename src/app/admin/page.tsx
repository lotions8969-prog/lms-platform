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

  const colorMap: Record<string, { num: string; bg: string; icon: string; border: string }> = {
    violet: { num: 'text-violet-600', bg: 'bg-violet-50',   icon: 'text-violet-600', border: 'border-l-violet-500' },
    blue:   { num: 'text-blue-600',   bg: 'bg-blue-50',     icon: 'text-blue-600',   border: 'border-l-blue-500' },
    emerald:{ num: 'text-emerald-600',bg: 'bg-emerald-50',  icon: 'text-emerald-600',border: 'border-l-emerald-500' },
    rose:   { num: 'text-rose-600',   bg: 'bg-rose-50',     icon: 'text-rose-600',   border: 'border-l-rose-500' },
    zinc:   { num: 'text-gray-600',   bg: 'bg-gray-50',     icon: 'text-gray-500',   border: 'border-l-gray-300' },
  };

  // Simple bar chart data
  const chartData = report?.courseStats.slice(0, 6) || [];
  const maxEnrolled = Math.max(...chartData.map((c) => c.enrolled), 1);

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">ダッシュボード</h1>
        <p className="text-zinc-400 text-sm mt-1">ENISHI LESSONS の管理パネル</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const c = colorMap[s.color];
          return (
            <Link key={s.label} href={s.href}>
              <div className={`bg-zinc-900 border border-zinc-800 border-l-4 ${c.border} rounded-2xl p-5 hover:bg-zinc-800/60 transition-all group cursor-pointer`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${c.icon}`} />
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                </div>
                {loading
                  ? <div className="h-8 bg-zinc-800 animate-pulse rounded-lg w-16 mb-1" />
                  : <p className={`text-3xl font-bold ${c.num}`}>{s.value}</p>
                }
                <p className="text-xs text-zinc-500 mt-1 font-medium">{s.label}</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">{s.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Course enrollment chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-white text-sm">コース別受講状況</h2>
              <p className="text-zinc-500 text-xs mt-0.5">各コースの受講者数と完了率</p>
            </div>
            <Link href="/admin/reports" className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium flex items-center gap-1">
              詳細レポート <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-zinc-800 rounded-xl animate-pulse" />)}
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 text-sm">データがありません</div>
          ) : (
            <div className="space-y-5">
              {chartData.map((c) => (
                <div key={c.courseId}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-300 font-medium truncate max-w-[55%]">{c.title}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-zinc-500">{c.enrolled}名</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.completionRate >= 70 ? 'bg-emerald-900/40 text-emerald-400' : 'bg-violet-900/30 text-violet-400'}`}>
                        {c.completionRate}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all"
                      style={{ width: `${maxEnrolled > 0 ? (c.enrolled / maxEnrolled) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.completionRate}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-5 pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2"><div className="w-3 h-2 bg-violet-500 rounded-full" /><span className="text-[11px] text-zinc-500">受講者数</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-1.5 bg-emerald-500 rounded-full" /><span className="text-[11px] text-zinc-500">完了率</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="font-bold text-white text-sm mb-1">クイックアクション</h2>
          <p className="text-zinc-500 text-xs mb-5">よく使う操作</p>
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
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-800 transition-colors group border border-transparent hover:border-zinc-700">
                  <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center shrink-0`}>
                    <a.icon className={`w-4 h-4 ${c.icon}`} />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors font-medium">{a.label}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 ml-auto transition-all group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-5">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="font-bold text-white text-sm">最近の提出物</h2>
            {pending > 0 && <p className="text-xs text-amber-400 mt-0.5">{pending}件のレビュー待ち</p>}
          </div>
          <Link href="/admin/submissions" className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium flex items-center gap-1">
            すべて見る <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="divide-y divide-zinc-800">
            {[...Array(4)].map((_, i) => <div key={i} className="h-14 px-6 py-3 flex items-center"><div className="h-4 bg-zinc-800 rounded animate-pulse w-48" /></div>)}
          </div>
        ) : submissions.length === 0 ? (
          <div className="px-6 py-10 text-center text-zinc-600 text-sm">提出物がありません</div>
        ) : (
          <div>
            {submissions.slice(0, 5).map((sub, i) => (
              <div key={sub.id} className={`flex items-center justify-between px-6 py-3.5 hover:bg-zinc-800/40 transition-colors ${i < submissions.slice(0,5).length - 1 ? 'border-b border-zinc-800/60' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    sub.status === 'pending' ? 'bg-amber-400' :
                    sub.status === 'approved' ? 'bg-emerald-400' : 'bg-zinc-600'
                  }`} />
                  <p className="text-sm text-zinc-300 truncate">{new Date(sub.createdAt).toLocaleDateString('ja-JP')}</p>
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <div>
              <h2 className="font-bold text-white text-sm">コース一覧</h2>
              <p className="text-zinc-500 text-xs mt-0.5">全{courses.length}件</p>
            </div>
            <Link href="/admin/courses" className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors flex items-center gap-1">
              すべて管理 <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {courses.slice(0, 5).map((course, i) => (
              <div key={course.id} className={`flex items-center justify-between px-6 py-4 hover:bg-zinc-800/40 transition-colors ${i < Math.min(courses.length, 5) - 1 ? 'border-b border-zinc-800/60' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {course.thumbnail
                      ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                      : <BookOpen className="w-4 h-4 text-zinc-500" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-200 text-sm truncate">{course.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {course.published !== false
                        ? <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium"><Eye className="w-3 h-3" />公開中</span>
                        : <span className="flex items-center gap-1 text-[11px] text-zinc-500"><EyeOff className="w-3 h-3" />下書き</span>
                      }
                    </div>
                  </div>
                </div>
                <Link href={`/admin/courses/${course.id}/lessons`}
                  className="text-xs px-3 py-1.5 text-violet-400 bg-violet-900/20 hover:bg-violet-900/40 rounded-lg font-semibold transition-colors shrink-0 border border-violet-900/30">
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
