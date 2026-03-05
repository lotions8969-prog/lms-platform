'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson, Quiz } from '@/lib/types';
import Navigation from '@/components/Navigation';
import VideoPlayer from '@/components/VideoPlayer';
import RecordingSection from '@/components/RecordingSection';
import QuizSection from '@/components/QuizSection';
import Link from 'next/link';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { use } from 'react';

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = use(params);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const { user, userData } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      const lessonDoc = await getDoc(doc(db, 'lessons', lessonId));
      if (lessonDoc.exists()) {
        const data = { id: lessonDoc.id, ...lessonDoc.data() } as Lesson;
        setLesson(data);
        if (data.type === 'quiz') {
          const quizSnap = await getDocs(
            query(collection(db, 'quizzes'), where('lessonId', '==', lessonId))
          );
          if (!quizSnap.empty) {
            setQuiz({ id: quizSnap.docs[0].id, ...quizSnap.docs[0].data() } as Quiz);
          }
        }
      }
      const alreadyDone = userData?.progress?.[courseId]?.completedLessons?.includes(lessonId);
      if (alreadyDone) setCompleted(true);
      setLoading(false);
    };
    fetch();
  }, [lessonId, courseId, userData]);

  const markComplete = async () => {
    if (!user || completed) return;
    await updateDoc(doc(db, 'users', user.uid), {
      [`progress.${courseId}.completedLessons`]: arrayUnion(lessonId),
    });
    setCompleted(true);
  };

  const handleRecordingUploaded = async (videoUrl: string) => {
    if (!user) return;
    await addDoc(collection(db, 'submissions'), {
      userId: user.uid,
      lessonId,
      courseId,
      videoUrl,
      status: 'pending',
      feedback: '',
      createdAt: serverTimestamp(),
    });
    await markComplete();
  };

  const handleQuizPass = async () => {
    await markComplete();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="aspect-video bg-gray-200 rounded-xl" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-400">
          レッスンが見つかりません
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href={`/courses/${courseId}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          コースに戻る
        </Link>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-gray-500 mt-1">{lesson.description}</p>
            )}
          </div>
          {completed && (
            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium shrink-0">
              <CheckCircle className="w-4 h-4" />
              完了
            </div>
          )}
        </div>

        <div className="space-y-6">
          {lesson.type === 'video' && (
            <>
              {lesson.videoUrl ? (
                <VideoPlayer videoUrl={lesson.videoUrl} onEnded={undefined} />
              ) : (
                <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">
                  動画が設定されていません
                </div>
              )}

              <RecordingSection
                userId={user!.uid}
                lessonId={lessonId}
                courseId={courseId}
                onUploaded={handleRecordingUploaded}
              />

              {!completed && (
                <div className="flex justify-end">
                  <button
                    onClick={markComplete}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    録画なしで完了にする
                  </button>
                </div>
              )}
            </>
          )}

          {lesson.type === 'quiz' && quiz && (
            <QuizSection quiz={quiz} onPass={handleQuizPass} />
          )}

          {lesson.type === 'quiz' && !quiz && (
            <div className="text-center py-12 text-gray-400">クイズが設定されていません</div>
          )}
        </div>
      </div>
    </div>
  );
}
