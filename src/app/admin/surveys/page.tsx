'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ClipboardList, Eye, EyeOff, Trash2, BarChart3, Globe } from 'lucide-react';

interface SurveyItem {
  id: string;
  title: string;
  description?: string;
  questions: { id: string }[];
  published: boolean;
  createdAt: string;
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/surveys').then((r) => r.json()).then((d) => { setSurveys(d); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('このアンケートを削除しますか？')) return;
    await fetch(`/api/surveys/${id}`, { method: 'DELETE' });
    setSurveys((prev) => prev.filter((s) => s.id !== id));
  };

  const togglePublish = async (survey: SurveyItem) => {
    const res = await fetch(`/api/surveys/${survey.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !survey.published }),
    });
    const updated = await res.json();
    setSurveys((prev) => prev.map((s) => s.id === survey.id ? updated : s));
  };

  return (
    <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">アンケート</h1>
          <p className="text-gray-500 text-sm mt-1">{surveys.length}件 · <span className="text-emerald-600">{surveys.filter((s) => s.published).length}件公開中</span></p>
        </div>
        <Link href="/admin/surveys/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm">
          <Plus className="w-4 h-4" />アンケートを作成
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white border border-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-700 font-medium mb-1">アンケートがまだありません</p>
          <p className="text-gray-400 text-sm mb-5">受講生の意見を収集しましょう</p>
          <Link href="/admin/surveys/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            <Plus className="w-4 h-4" />アンケートを作成
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {surveys.map((survey) => (
            <div key={survey.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${survey.published ? 'bg-indigo-50' : 'bg-gray-100'}`}>
                <ClipboardList className={`w-5 h-5 ${survey.published ? 'text-indigo-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{survey.title}</h3>
                  {survey.published
                    ? <span className="shrink-0 flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium"><Globe className="w-2.5 h-2.5" />公開中</span>
                    : <span className="shrink-0 flex items-center gap-1 text-[10px] bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full font-medium"><EyeOff className="w-2.5 h-2.5" />下書き</span>
                  }
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{survey.questions.length}問 · {new Date(survey.createdAt).toLocaleDateString('ja-JP')}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link href={`/admin/surveys/${survey.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  <BarChart3 className="w-3.5 h-3.5" />回答を見る
                </Link>
                <button onClick={() => togglePublish(survey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    survey.published
                      ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                      : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                  }`}>
                  {survey.published ? <><EyeOff className="w-3.5 h-3.5" />非公開</> : <><Eye className="w-3.5 h-3.5" />公開する</>}
                </button>
                <button onClick={() => handleDelete(survey.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
