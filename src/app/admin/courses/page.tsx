'use client';

import { useEffect, useState } from 'react';
import { Course } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { Plus, Trash2, BookOpen, ChevronRight } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/courses').then((r) => r.json()).then((d) => { setCourses(d); setLoading(false); }); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('このコースを削除しますか？')) return;
    await fetch('/api/courses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold text-gray-900">コース管理</h1><p className="text-gray-500 mt-1">{courses.length}件</p></div>
          <Link href="/admin/courses/new" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />新しいコース
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20"><BookOpen className="w-16 h-16 mx-auto text-gray-200 mb-4" /><p className="text-gray-400">コースがまだありません</p></div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0"><BookOpen className="w-6 h-6 text-blue-600" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{course.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/admin/courses/${course.id}/lessons/new`} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
                    <Plus className="w-4 h-4" />レッスン追加
                  </Link>
                  <Link href={`/admin/courses/${course.id}/lessons`} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg">
                    <ChevronRight className="w-4 h-4" />一覧
                  </Link>
                  <button onClick={() => handleDelete(course.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
