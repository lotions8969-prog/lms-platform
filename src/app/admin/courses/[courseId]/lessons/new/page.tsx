'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface QuizQuestionInput { question: string; options: string[]; answer: number; }

export default function NewLessonPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [type, setType] = useState<'video' | 'quiz'>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [order, setOrder] = useState(1);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestionInput[]>([{ question: '', options: ['', '', '', ''], answer: 0 }]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, type, title, description: description || undefined, videoUrl: type === 'video' ? videoUrl : undefined, order, questions: type === 'quiz' ? questions : undefined, passingScore }),
    });
    router.replace(`/admin/courses/${courseId}/lessons`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href={`/admin/courses/${courseId}/lessons`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />レッスン一覧に戻る
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">新しいレッスンを追加</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">レッスンタイプ</label>
              <div className="flex gap-3">
                {(['video', 'quiz'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${type === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                    {t === 'video' ? '動画レッスン' : 'クイズ'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">タイトル <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">説明（任意）</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">表示順</label>
              <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={1} className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            {type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">動画URL <span className="text-red-500">*</span></label>
                <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required={type === 'video'} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
              </div>
            )}
            {type === 'quiz' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">合格ライン（%）</label>
                  <input type="number" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} min={1} max={100} className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-800">問題一覧</h3>
                    <button type="button" onClick={() => setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: 0 }])} className="flex items-center gap-1 text-sm text-blue-600">
                      <Plus className="w-4 h-4" />問題を追加
                    </button>
                  </div>
                  {questions.map((q, qi) => (
                    <div key={qi} className="border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">問題 {qi + 1}</span>
                        {questions.length > 1 && <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qi))} className="text-red-400"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                      <input type="text" value={q.question} onChange={(e) => { const u=[...questions]; u[qi].question=e.target.value; setQuestions(u); }} required placeholder="問題文を入力" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`answer-${qi}`} checked={q.answer===oi} onChange={() => { const u=[...questions]; u[qi].answer=oi; setQuestions(u); }} />
                          <input type="text" value={opt} onChange={(e) => { const u=[...questions]; u[qi].options[oi]=e.target.value; setQuestions(u); }} required placeholder={`選択肢 ${String.fromCharCode(65+oi)}`} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      ))}
                      <p className="text-xs text-gray-400">ラジオボタンで正解を選択</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              <Save className="w-4 h-4" />{loading ? '保存中...' : 'レッスンを保存'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
