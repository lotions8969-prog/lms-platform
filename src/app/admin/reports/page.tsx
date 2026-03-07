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
    <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">レポート</h1>
        <p className="text-gray-500 text-sm mt-1">受講者の進捗状況とコース完了状況</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: '総受講生', value: data?.totalStudents ?? '—', sub: '登録ユーザー', icon: Users, color: 'indigo' },
          { label: 'アクティブ受講生', value: data?.activeStudents ?? '—', sub: '学習中', icon: TrendingUp, color: 'blue' },
          { label: 'コース完了数', value: data?.totalCompletions ?? '—', sub: '累計', icon: BookOpen, color: 'emerald' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
              s.color === 'indigo' ? 'bg-indigo-50' : s.color === 'blue' ? 'bg-blue-50' : 'bg-emerald-50'
            }`}>
              <s.icon className={`w-4.5 h-4.5 ${
                s.color === 'indigo' ? 'text-indigo-600' : s.color === 'blue' ? 'text-blue-600' : 'text-emerald-600'
              }`} />
            </div>
            {loading ? <div className="h-7 bg-gray-100 rounded w-12 animate-pulse mb-1" /> : (
              <p className={`text-3xl font-bold ${
                s.color === 'indigo' ? 'text-indigo-600' : s.color === 'blue' ? 'text-blue-600' : 'text-emerald-600'
              }`}>{s.value}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            <p className="text-[11px] text-gray-300 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('courses')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'courses' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400'
          }`}>
          コース別レポート
        </button>
        <button onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400'
          }`}>
          ユーザー別レポート
        </button>
      </div>

      {/* Course stats */}
      {tab === 'courses' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-4">コース名</div>
              <div className="col-span-2 text-center">受講者</div>
              <div className="col-span-2 text-center">完了者</div>
              <div className="col-span-4">完了率</div>
            </div>
          </div>
          {loading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 px-5 animate-pulse flex items-center"><div className="h-4 bg-gray-100 rounded w-full" /></div>)}
            </div>
          ) : !data || data.courseStats.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 text-gray-200" />データがありません
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.courseStats.map((course) => (
                <div key={course.courseId} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{course.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium ${course.published ? 'text-emerald-500' : 'text-gray-400'}`}>
                          {course.published ? '公開中' : '下書き'}
                        </span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{course.totalLessons}レッスン</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-xl font-bold text-gray-800">{course.enrolled}</p>
                      <p className="text-[10px] text-gray-400">名</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-xl font-bold text-emerald-600">{course.completed}</p>
                      <p className="text-[10px] text-gray-400">名</p>
                    </div>
                    <div className="col-span-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">完了率</span>
                        <span className="text-xs font-semibold text-indigo-600">{course.completionRate}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${course.completionRate}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-400">平均進捗</span>
                        <span className="text-[10px] text-gray-500">{course.avgProgress}%</span>
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
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-4">ユーザー</div>
              <div className="col-span-2 text-center">受講コース</div>
              <div className="col-span-2 text-center">完了コース</div>
              <div className="col-span-2 text-center">完了レッスン</div>
              <div className="col-span-2 text-center">登録日</div>
            </div>
          </div>
          {loading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 px-5 animate-pulse flex items-center"><div className="h-4 bg-gray-100 rounded w-full" /></div>)}
            </div>
          ) : !data || data.userStats.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />受講生のデータがありません
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.userStats.map((user) => (
                <div key={user.userId} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{user.displayName || user.email}</p>
                      {user.displayName && <p className="text-xs text-gray-400 truncate">{user.email}</p>}
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-lg font-bold text-gray-700">{user.enrolledCourses}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-lg font-bold text-emerald-600">{user.completedCourses}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-lg font-bold text-indigo-600">{user.totalLessonsDone}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString('ja-JP')}</p>
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
