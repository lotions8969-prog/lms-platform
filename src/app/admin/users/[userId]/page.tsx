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

interface CourseInfo {
  id: string;
  title: string;
  published: boolean;
}

interface LessonInfo {
  id: string;
  courseId: string;
  title: string;
  order: number;
}

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

  // Form state
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

  const inputCls = "w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider";

  if (loading) return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto animate-pulse space-y-4">
      <div className="h-6 bg-zinc-900 rounded w-48" />
      <div className="h-64 bg-zinc-900 rounded-2xl" />
    </div>
  );

  if (!user) return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto text-center text-zinc-500">ユーザーが見つかりません</div>
  );

  const enrolledCourses = courses.filter((c) => user.progress[c.id]);

  return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />ユーザー管理
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${user.role === 'admin' ? 'bg-violet-700 text-white' : 'bg-zinc-700 text-zinc-200'}`}>
            {(user.displayName || user.email).slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user.displayName || user.email}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                user.role === 'admin' ? 'bg-violet-900/40 text-violet-300 border-violet-800/50' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {user.role === 'admin' ? <><Shield className="w-2.5 h-2.5" />管理者</> : <><GraduationCap className="w-2.5 h-2.5" />受講生</>}
              </span>
              <span className="text-xs text-zinc-600">登録: {new Date(user.createdAt).toLocaleDateString('ja-JP')}</span>
            </div>
          </div>
        </div>
        <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 text-xs text-rose-400 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/50 rounded-xl font-medium transition-colors">
          <Trash2 className="w-3.5 h-3.5" />削除
        </button>
      </div>

      <div className="space-y-4">
        {/* Basic info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white text-sm mb-5">基本情報</h2>
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-900/50 text-rose-400 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 px-4 py-3 rounded-xl text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />{success}
              </div>
            )}
            <div>
              <label className={labelCls}>表示名</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} placeholder="任意" />
            </div>
            <div>
              <label className={labelCls}>メールアドレス</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>ロール</label>
              <div className="flex gap-3">
                {(['student', 'admin'] as const).map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      role === r ? 'border-violet-600 bg-violet-900/30 text-violet-300' : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
                    }`}>
                    {r === 'student' ? '受講生' : '管理者'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>新しいパスワード <span className="text-zinc-600 normal-case font-normal">(変更する場合のみ入力)</span></label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className={inputCls} placeholder="8文字以上推奨" autoComplete="new-password" />
            </div>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
              <Save className="w-4 h-4" />{saving ? '保存中...' : '変更を保存'}
            </button>
          </form>
        </div>

        {/* Progress management */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white text-sm mb-1">受講進捗管理</h2>
          <p className="text-zinc-600 text-xs mb-5">チェックを切り替えてレッスンの完了状態を手動変更できます</p>

          {enrolledCourses.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-sm">受講中のコースがありません</div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses.map((course) => {
                const courseLessons = allLessons.filter((l) => l.courseId === course.id).sort((a, b) => a.order - b.order);
                const done = user.progress[course.id]?.completedLessons || [];
                const pct = courseLessons.length > 0 ? Math.round((done.length / courseLessons.length) * 100) : 0;
                return (
                  <div key={course.id} className="border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-zinc-200 text-sm">{course.title}</p>
                      <span className="text-xs text-zinc-500">{done.length}/{courseLessons.length} ({pct}%)</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full mb-3">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="space-y-1.5">
                      {courseLessons.map((lesson) => {
                        const isDone = done.includes(lesson.id);
                        return (
                          <button key={lesson.id} type="button"
                            onClick={() => handleProgressToggle(course.id, lesson.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors text-left group">
                            {isDone
                              ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              : <Circle className="w-4 h-4 text-zinc-700 shrink-0 group-hover:text-zinc-500" />
                            }
                            <span className={`text-xs truncate ${isDone ? 'text-zinc-400' : 'text-zinc-500'}`}>{lesson.title}</span>
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
