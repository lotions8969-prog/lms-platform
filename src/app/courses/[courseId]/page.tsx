'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Lesson } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle, Lock, Play, FileQuestion, ChevronLeft } from 'lucide-react';
import { use } from 'react';

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
      }
      const lessonsSnap = await getDocs(
        query(collection(db, 'lessons'), where('courseId', '==', courseId), orderBy('order'))
      );
      setLessons(lessonsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson)));
      setLoading(false);
    };
    fetch();
  }, [courseId]);

  const completedLessons = userData?.progress?.[courseId]?.completedLessons || [];
  const isCompleted = (lessonId: string) => completedLessons.includes(lessonId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/courses" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          コース一覧に戻る
        </Link>

        {course && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-500 mt-2">{course.description}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-gray-500">{lessons.length}レッスン</span>
              <span className="text-sm text-blue-600 font-medium">{completedLessons.length}完了</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const done = isCompleted(lesson.id);
            const isLocked = index > 0 && !isCompleted(lessons[index - 1].id);

            return (
              <div key={lesson.id}>
                {isLocked ? (
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 opacity-60 cursor-not-allowed">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">{lesson.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">前のレッスンを完了してください</p>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {lesson.type === 'quiz' ? 'クイズ' : '動画'}
                    </span>
                  </div>
                ) : (
                  <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                    <div className={`flex items-center gap-4 p-4 bg-white rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${done ? 'border-green-200' : 'border-gray-200'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {done ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : lesson.type === 'quiz' ? (
                          <FileQuestion className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Play className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{lesson.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {done ? '完了' : lesson.type === 'quiz' ? 'クイズ' : '動画レッスン'}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${done ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {done ? '完了' : lesson.type === 'quiz' ? 'クイズ' : '動画'}
                      </span>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
