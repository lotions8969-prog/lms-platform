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
    <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">アンケート</h1>
          <p className="text-zinc-500 text-sm mt-1">{surveys.length}件 · {surveys.filter((s) => s.published).length}件公開中</p>
        </div>
        <Link href="/admin/surveys/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/30">
          <Plus className="w-4 h-4" />アンケートを作成
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />)}</div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-24 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <ClipboardList className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 font-medium mb-1">アンケートがまだありません</p>
          <p className="text-zinc-600 text-sm mb-5">受講生の意見を収集しましょう</p>
          <Link href="/admin/surveys/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500">
            <Plus className="w-4 h-4" />アンケートを作成
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {surveys.map((survey) => (
            <div key={survey.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4 hover:border-zinc-700 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${survey.published ? 'bg-violet-900/40' : 'bg-zinc-800'}`}>
                <ClipboardList className={`w-5 h-5 ${survey.published ? 'text-violet-400' : 'text-zinc-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-100 text-sm truncate">{survey.title}</h3>
                  {survey.published
                    ? <span className="shrink-0 flex items-center gap-1 text-[10px] bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium"><Globe className="w-2.5 h-2.5" />公開中</span>
                    : <span className="shrink-0 flex items-center gap-1 text-[10px] bg-zinc-800 text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded-full font-medium"><EyeOff className="w-2.5 h-2.5" />下書き</span>
                  }
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">{survey.questions.length}問 · {new Date(survey.createdAt).toLocaleDateString('ja-JP')}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link href={`/admin/surveys/${survey.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-colors">
                  <BarChart3 className="w-3.5 h-3.5" />回答を見る
                </Link>
                <button onClick={() => togglePublish(survey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    survey.published
                      ? 'text-zinc-400 bg-zinc-800 hover:bg-zinc-700'
                      : 'text-emerald-400 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/50'
                  }`}>
                  {survey.published ? <><EyeOff className="w-3.5 h-3.5" />非公開</> : <><Eye className="w-3.5 h-3.5" />公開する</>}
                </button>
                <button onClick={() => handleDelete(survey.id)}
                  className="p-1.5 text-zinc-700 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors">
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
