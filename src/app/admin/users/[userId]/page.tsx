'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { ChevronLeft, Save, Trash2, CheckCircle, Circle, AlertCircle, Shield, GraduationCap } from 'lucide-react';

interface UserDetail {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'student';
  createdAt: string;
  progress: Record<string, {
    completedLessons: string[];
    completed: boolean;
    quizScores: Record<string, number>;
  }>;
}

interface CourseInfo { id: string; title: string; published: boolean; }
interface LessonInfo { id: string; courseId: string; title: string; order: number; }

export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [allLessons, setAllLessons] = useState<LessonInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'student'>('student');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${userId}`).then((r) => r.json()),
      fetch('/api/courses').then((r) => r.json()),
      fetch('/api/lessons').then((r) => r.json()),
    ]).then(([u, c, l]) => {
      setUser(u);
      setDisplayName(u.displayName || '');
      setEmail(u.email || '');
      setRole(u.role);
      setCourses(c);
      setAllLessons(l);
      setLoading(false);
    });
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const body: Record<string, string> = { displayName, email, role };
    if (newPassword) body.password = newPassword;
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
      setNewPassword('');
      setSuccess('保存しました');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      const d = await res.json();
      setError(d.error || 'エラーが発生しました');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('このユーザーを削除しますか？この操作は取り消せません。')) return;
    await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    router.replace('/admin/users');
  };

  const handleProgressToggle = async (courseId: string, lessonId: string) => {
    if (!user) return;
    const progress = { ...user.progress };
    if (!progress[courseId]) progress[courseId] = { completedLessons: [], completed: false, quizScores: {} };
    const lessons = [...progress[courseId].completedLessons];
    const idx = lessons.indexOf(lessonId);
    if (idx >= 0) lessons.splice(idx, 1);
    else lessons.push(lessonId);
    const courseLessons = allLessons.filter((l) => l.courseId === courseId);
    progress[courseId] = {
      ...progress[courseId],
      completedLessons: lessons,
      completed: lessons.length >= courseLessons.length && courseLessons.length > 0,
    };
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUser((prev) => prev ? { ...prev, progress: updated.progress } : null);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";

  if (loading) return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto animate-pulse space-y-4">
      <div className="h-6 bg-gray-100 rounded w-48" />
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );

  if (!user) return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto text-center text-gray-400">ユーザーが見つかりません</div>
  );

  const enrolledCourses = courses.filter((c) => user.progress[c.id]);

  return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />ユーザー管理
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
            {(user.displayName || user.email).slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.displayName || user.email}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                {user.role === 'admin' ? <><Shield className="w-2.5 h-2.5" />管理者</> : <><GraduationCap className="w-2.5 h-2.5" />受講生</>}
              </span>
              <span className="text-xs text-gray-400">登録: {new Date(user.createdAt).toLocaleDateString('ja-JP')}</span>
            </div>
          </div>
        </div>
        <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors">
          <Trash2 className="w-3.5 h-3.5" />削除
        </button>
      </div>

      <div className="space-y-4">
        {/* Basic info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-sm mb-5">基本情報</h2>
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />{success}
              </div>
            )}
            <div>
              <label className={labelCls}>表示名 <span className="text-gray-400 font-normal">（任意）</span></label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} placeholder="任意" />
            </div>
            <div>
              <label className={labelCls}>メールアドレス <span className="text-red-500">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>ロール</label>
              <div className="flex gap-3">
                {(['student', 'admin'] as const).map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                      role === r ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {r === 'student' ? '受講生' : '管理者'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>新しいパスワード <span className="text-gray-400 font-normal">（変更する場合のみ）</span></label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className={inputCls} placeholder="8文字以上推奨" autoComplete="new-password" />
            </div>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 shadow-sm">
              <Save className="w-4 h-4" />{saving ? '保存中...' : '変更を保存'}
            </button>
          </form>
        </div>

        {/* Progress management */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-sm mb-1">受講進捗管理</h2>
          <p className="text-gray-400 text-xs mb-5">チェックを切り替えてレッスンの完了状態を手動変更できます</p>

          {enrolledCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">受講中のコースがありません</div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses.map((course) => {
                const courseLessons = allLessons.filter((l) => l.courseId === course.id).sort((a, b) => a.order - b.order);
                const done = user.progress[course.id]?.completedLessons || [];
                const pct = courseLessons.length > 0 ? Math.round((done.length / courseLessons.length) * 100) : 0;
                return (
                  <div key={course.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-800 text-sm">{course.title}</p>
                      <span className="text-xs text-gray-500">{done.length}/{courseLessons.length} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full mb-3">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="space-y-1">
                      {courseLessons.map((lesson) => {
                        const isDone = done.includes(lesson.id);
                        return (
                          <button key={lesson.id} type="button"
                            onClick={() => handleProgressToggle(course.id, lesson.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white transition-colors text-left group">
                            {isDone
                              ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                              : <Circle className="w-4 h-4 text-gray-300 shrink-0 group-hover:text-gray-400" />
                            }
                            <span className={`text-xs truncate ${isDone ? 'text-gray-400 line-through' : 'text-gray-600'}`}>{lesson.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
