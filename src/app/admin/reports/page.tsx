'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen } from 'lucide-react';

interface CourseStatItem {
  courseId: string;
  title: string;
  published: boolean;
  totalLessons: number;
  enrolled: number;
  completed: number;
  completionRate: number;
  avgProgress: number;
}

interface UserStatItem {
  userId: string;
  email: string;
  displayName?: string;
  createdAt: string;
  enrolledCourses: number;
  completedCourses: number;
  totalLessonsDone: number;
}

interface ReportData {
  courseStats: CourseStatItem[];
  userStats: UserStatItem[];
  totalStudents: number;
  activeStudents: number;
  totalCompletions: number;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'courses' | 'users'>('courses');

  useEffect(() => {
    fetch('/api/reports').then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">レポート</h1>
        <p className="text-zinc-500 text-sm mt-1">受講者の進捗状況とコース完了状況</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { label: '総受講生', value: data?.totalStudents ?? '—', sub: '登録ユーザー', icon: Users, color: 'violet' },
          { label: 'アクティブ受講生', value: data?.activeStudents ?? '—', sub: '学習中', icon: TrendingUp, color: 'blue' },
          { label: 'コース完了数', value: data?.totalCompletions ?? '—', sub: '累計', icon: BookOpen, color: 'emerald' },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
              s.color === 'violet' ? 'bg-violet-500/10' : s.color === 'blue' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
            }`}>
              <s.icon className={`w-4 h-4 ${
                s.color === 'violet' ? 'text-violet-400' : s.color === 'blue' ? 'text-blue-400' : 'text-emerald-400'
              }`} />
            </div>
            {loading ? <div className="h-7 bg-zinc-800 rounded w-12 animate-pulse mb-1" /> : (
              <p className={`text-3xl font-bold ${
                s.color === 'violet' ? 'text-violet-400' : s.color === 'blue' ? 'text-blue-400' : 'text-emerald-400'
              }`}>{s.value}</p>
            )}
            <p className="text-xs text-zinc-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('courses')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'courses' ? 'bg-violet-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}>
          コース別レポート
        </button>
        <button onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'users' ? 'bg-violet-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}>
          ユーザー別レポート
        </button>
      </div>

      {/* Course stats */}
      {tab === 'courses' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800">
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              <div className="col-span-4">コース名</div>
              <div className="col-span-2 text-center">受講者</div>
              <div className="col-span-2 text-center">完了者</div>
              <div className="col-span-4">完了率</div>
            </div>
          </div>
          {loading ? (
            <div className="divide-y divide-zinc-800/50">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 px-5 animate-pulse flex items-center"><div className="h-4 bg-zinc-800 rounded w-full" /></div>)}
            </div>
          ) : !data || data.courseStats.length === 0 ? (
            <div className="py-16 text-center text-zinc-600 text-sm">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />データがありません
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {data.courseStats.map((course) => (
                <div key={course.courseId} className="px-5 py-4 hover:bg-zinc-800/30 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{course.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] ${course.published ? 'text-emerald-500' : 'text-zinc-600'}`}>
                          {course.published ? '公開中' : '下書き'}
                        </span>
                        <span className="text-[10px] text-zinc-700">·</span>
                        <span className="text-[10px] text-zinc-600">{course.totalLessons}レッスン</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-xl font-bold text-zinc-200">{course.enrolled}</p>
                      <p className="text-[10px] text-zinc-600">名</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-xl font-bold text-emerald-400">{course.completed}</p>
                      <p className="text-[10px] text-zinc-600">名</p>
                    </div>
                    <div className="col-span-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-500">完了率</span>
                        <span className="text-xs font-semibold text-violet-400">{course.completionRate}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${course.completionRate}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-zinc-600">平均進捗</span>
                        <span className="text-[10px] text-zinc-500">{course.avgProgress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User stats */}
      {tab === 'users' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800">
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              <div className="col-span-4">ユーザー</div>
              <div className="col-span-2 text-center">受講コース</div>
              <div className="col-span-2 text-center">完了コース</div>
              <div className="col-span-2 text-center">完了レッスン</div>
              <div className="col-span-2 text-center">登録日</div>
            </div>
          </div>
          {loading ? (
            <div className="divide-y divide-zinc-800/50">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 px-5 animate-pulse flex items-center"><div className="h-4 bg-zinc-800 rounded w-full" /></div>)}
            </div>
          ) : !data || data.userStats.length === 0 ? (
            <div className="py-16 text-center text-zinc-600 text-sm">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />受講生のデータがありません
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {data.userStats.map((user) => (
                <div key={user.userId} className="px-5 py-4 hover:bg-zinc-800/30 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{user.displayName || user.email}</p>
                      {user.displayName && <p className="text-xs text-zinc-500 truncate">{user.email}</p>}
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-lg font-bold text-zinc-300">{user.enrolledCourses}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-lg font-bold text-emerald-400">{user.completedCourses}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-lg font-bold text-violet-400">{user.totalLessonsDone}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-xs text-zinc-500">{new Date(user.createdAt).toLocaleDateString('ja-JP')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
