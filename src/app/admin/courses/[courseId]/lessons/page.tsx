'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Lesson } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Play, FileQuestion, Trash2, GripVertical } from 'lucide-react';
import { use } from 'react';

export default function CourseLearnssonsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    const snap = await getDocs(
      query(collection(getFirebaseDb(), 'lessons'), where('courseId', '==', courseId), orderBy('order'))
    );
    setLessons(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson)));
    setLoading(false);
  };

  useEffect(() => { fetchLessons(); }, [courseId]);

  const handleDelete = async (id: string) => {
    if (!confirm('このレッスンを削除しますか？')) return;
    await deleteDoc(doc(getFirebaseDb(), 'lessons', id));
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/admin/courses" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          コース一覧に戻る
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">レッスン一覧</h1>
          <Link href={`/admin/courses/${courseId}/lessons/new`} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            レッスン追加
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>レッスンがまだありません</p>
            <Link href={`/admin/courses/${courseId}/lessons/new`} className="mt-3 inline-flex items-center gap-1 text-blue-600 hover:underline text-sm">
              <Plus className="w-4 h-4" />
              最初のレッスンを追加
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${lesson.type === 'quiz' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  {lesson.type === 'quiz' ? (
                    <FileQuestion className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Play className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{lesson.title}</p>
                  <p className="text-xs text-gray-400">順番: {lesson.order} · {lesson.type === 'quiz' ? 'クイズ' : '動画'}</p>
                </div>
                <button onClick={() => handleDelete(lesson.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
