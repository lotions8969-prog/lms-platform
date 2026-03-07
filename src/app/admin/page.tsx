'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, FileCheck, Clock, ChevronRight, ArrowUpRight, Eye, EyeOff, TrendingUp, Activity, Plus } from 'lucide-react';
import type { Course, Submission } from '@/lib/types';

interface ReportData {
  totalStudents: number;
  activeStudents: number;
  totalCompletions: number;
  courseStats: { courseId: string; title: string; enrolled: number; completed: number; completionRate: number }[];
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
      color: 'indigo',
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
      color: pending > 0 ? 'rose' : 'gray',
    },
  ];

  const colorMap: Record<string, { num: string; bg: string; icon: string; border: string }> = {
    indigo:  { num: 'text-indigo-600',  bg: 'bg-indigo-50',   icon: 'text-indigo-500',  border: 'border-t-indigo-500' },
    blue:    { num: 'text-blue-600',    bg: 'bg-blue-50',     icon: 'text-blue-500',    border: 'border-t-blue-500' },
    emerald: { num: 'text-emerald-600', bg: 'bg-emerald-50',  icon: 'text-emerald-500', border: 'border-t-emerald-500' },
    rose:    { num: 'text-rose-600',    bg: 'bg-rose-50',     icon: 'text-rose-500',    border: 'border-t-rose-500' },
    gray:    { num: 'text-gray-700',    bg: 'bg-gray-100',    icon: 'text-gray-400',    border: 'border-t-gray-300' },
  };

  const chartData = report?.courseStats.slice(0, 6) || [];
  const maxEnrolled = Math.max(...chartData.map((c) => c.enrolled), 1);

  return (
    <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-500 text-sm mt-1">ENISHI LESSONS の管理パネル</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const c = colorMap[s.color];
          return (
            <Link key={s.label} href={s.href}>
              <div className={`bg-white border border-gray-200 border-t-2 ${c.border} rounded-xl p-5 hover:shadow-md transition-all group cursor-pointer`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center`}>
                    <s.icon className={`w-4.5 h-4.5 ${c.icon}`} />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                {loading
                  ? <div className="h-8 bg-gray-100 animate-pulse rounded-lg w-16 mb-1" />
                  : <p className={`text-3xl font-bold ${c.num}`}>{s.value}</p>
                }
                <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Course enrollment chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900 text-sm">コース別受講状況</h2>
              <p className="text-gray-400 text-xs mt-0.5">各コースの受講者数と完了率</p>
            </div>
            <Link href="/admin/reports" className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors font-medium flex items-center gap-1">
              詳細レポート <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">データがありません</div>
          ) : (
            <div className="space-y-5">
              {chartData.map((c) => (
                <div key={c.courseId}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 font-medium truncate max-w-[55%]">{c.title}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-400">{c.enrolled}名</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        c.completionRate >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {c.completionRate}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all"
                      style={{ width: `${maxEnrolled > 0 ? (c.enrolled / maxEnrolled) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${c.completionRate}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-5 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2"><div className="w-3 h-2 bg-indigo-400 rounded-full" /><span className="text-[11px] text-gray-400">受講者数</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-1.5 bg-emerald-400 rounded-full" /><span className="text-[11px] text-gray-400">完了率</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-1">クイックアクション</h2>
          <p className="text-gray-400 text-xs mb-5">よく使う操作</p>
          <div className="space-y-1.5">
            {[
              { href: '/admin/courses/new', label: 'コースを作成', icon: BookOpen, color: 'indigo' },
              { href: '/admin/users', label: 'ユーザー管理', icon: Users, color: 'blue' },
              { href: '/admin/surveys/new', label: 'アンケートを作成', icon: Activity, color: 'emerald' },
              { href: '/admin/submissions', label: '提出物レビュー', icon: FileCheck, color: pending > 0 ? 'rose' : 'gray' },
            ].map((a) => {
              const c = colorMap[a.color];
              return (
                <Link key={a.href} href={a.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center shrink-0`}>
                    <a.icon className={`w-4 h-4 ${c.icon}`} />
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors font-medium">{a.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 ml-auto transition-all group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">最近の提出物</h2>
            {pending > 0 && <p className="text-xs text-amber-500 mt-0.5">{pending}件のレビュー待ち</p>}
          </div>
          <Link href="/admin/submissions" className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors font-medium flex items-center gap-1">
            すべて見る <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => <div key={i} className="h-14 px-6 py-3 flex items-center"><div className="h-4 bg-gray-100 rounded animate-pulse w-48" /></div>)}
          </div>
        ) : submissions.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">提出物がありません</div>
        ) : (
          <div>
            {submissions.slice(0, 5).map((sub, i) => (
              <div key={sub.id} className={`flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors ${i < submissions.slice(0,5).length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    sub.status === 'pending' ? 'bg-amber-400' :
                    sub.status === 'approved' ? 'bg-emerald-400' : 'bg-gray-300'
                  }`} />
                  <p className="text-sm text-gray-600 truncate">{new Date(sub.createdAt).toLocaleDateString('ja-JP')}</p>
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                  sub.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                  sub.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-gray-100 text-gray-500'
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
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-900 text-sm">コース一覧</h2>
              <p className="text-gray-400 text-xs mt-0.5">全{courses.length}件</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/courses/new"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                <Plus className="w-3.5 h-3.5" />新規作成
              </Link>
              <Link href="/admin/courses" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors flex items-center gap-1">
                すべて管理 <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div>
            {courses.slice(0, 5).map((course, i) => (
              <div key={course.id} className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${i < Math.min(courses.length, 5) - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {course.thumbnail
                      ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                      : <BookOpen className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{course.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {course.published !== false
                        ? <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium"><Eye className="w-3 h-3" />公開中</span>
                        : <span className="flex items-center gap-1 text-[11px] text-gray-400"><EyeOff className="w-3 h-3" />下書き</span>
                      }
                    </div>
                  </div>
                </div>
                <Link href={`/admin/courses/${course.id}/lessons`}
                  className="text-xs px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-semibold transition-colors shrink-0">
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
