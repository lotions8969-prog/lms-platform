'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle, ChevronRight, GraduationCap } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/courses').then((r) => r.json()).then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const isCompleted = (courseId: string) => user?.progress?.[courseId]?.completed;
  const completedCount = (courseId: string) => user?.progress?.[courseId]?.completedLessons?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600" />コース一覧
          </h1>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>コースがまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white opacity-60" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{course.title}</h2>
                      {isCompleted(course.id) && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                    {completedCount(course.id) > 0 && (
                      <p className="text-xs text-blue-600 mt-2 font-medium">{completedCount(course.id)}レッスン完了</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isCompleted(course.id) ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {isCompleted(course.id) ? '完了' : '学習中'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
