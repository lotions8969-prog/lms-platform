'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Users, Globe, EyeOff, ExternalLink, ClipboardList } from 'lucide-react';

interface SurveyQuestion {
  id: string;
  type: 'text' | 'single' | 'multiple' | 'rating';
  question: string;
  options?: string[];
  required: boolean;
}

interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  published: boolean;
  createdAt: string;
}

interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  answers: Record<string, string | string[]>;
  createdAt: string;
}

export default function SurveyDetailPage({ params }: { params: Promise<{ surveyId: string }> }) {
  const { surveyId } = use(params);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/surveys/${surveyId}`).then((r) => r.json()),
      fetch(`/api/surveys/${surveyId}/responses`).then((r) => r.json()),
    ]).then(([s, r]) => {
      setSurvey(s);
      setResponses(r);
      setLoading(false);
    });
  }, [surveyId]);

  const togglePublish = async () => {
    if (!survey) return;
    setToggling(true);
    const res = await fetch(`/api/surveys/${surveyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !survey.published }),
    });
    const updated = await res.json();
    setSurvey(updated);
    setToggling(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/surveys/${surveyId}`);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Aggregate answers per question
  const getAnswerStats = (question: SurveyQuestion) => {
    const answers = responses.map((r) => r.answers[question.id]).filter(Boolean);
    if (question.type === 'text') {
      return { type: 'text', values: answers as string[] };
    }
    if (question.type === 'rating') {
      const nums = answers.map((a) => Number(a)).filter((n) => !isNaN(n));
      const avg = nums.length > 0 ? (nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(1) : '-';
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      nums.forEach((n) => { if (dist[n] !== undefined) dist[n]++; });
      return { type: 'rating', avg, dist, total: nums.length };
    }
    // single / multiple
    const counts: Record<string, number> = {};
    answers.forEach((a) => {
      const vals = Array.isArray(a) ? a : [a];
      vals.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
    });
    return { type: 'choice', counts, total: answers.length };
  };

  if (loading) return (
    <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto animate-pulse space-y-4">
      <div className="h-6 bg-gray-100 rounded w-48" />
      <div className="h-40 bg-gray-100 rounded-xl" />
    </div>
  );

  if (!survey) return (
    <div className="px-4 sm:px-6 py-8 text-center text-gray-400">アンケートが見つかりません</div>
  );

  return (
    <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      <Link href="/admin/surveys" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />アンケート一覧
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-bold text-gray-900 truncate">{survey.title}</h1>
              {survey.published
                ? <span className="shrink-0 flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium"><Globe className="w-2.5 h-2.5" />公開中</span>
                : <span className="shrink-0 flex items-center gap-1 text-[10px] bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full font-medium"><EyeOff className="w-2.5 h-2.5" />下書き</span>
              }
            </div>
            {survey.description && <p className="text-sm text-gray-500">{survey.description}</p>}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-bold text-gray-800">{responses.length}</span>
                <span className="text-xs text-gray-500">件の回答</span>
              </div>
              <span className="text-xs text-gray-400">{survey.questions.length}問</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={copyLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                copiedUrl ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
              }`}>
              <ExternalLink className="w-3.5 h-3.5" />{copiedUrl ? 'コピー済み' : 'リンクをコピー'}
            </button>
            {survey.published && (
              <Link href={`/surveys/${surveyId}`} target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-medium transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />プレビュー
              </Link>
            )}
            <button onClick={togglePublish} disabled={toggling}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 border ${
                survey.published ? 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
              }`}>
              {survey.published ? <><EyeOff className="w-3.5 h-3.5" />非公開</> : <><Globe className="w-3.5 h-3.5" />公開する</>}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {responses.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
          <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">まだ回答がありません</p>
          <p className="text-gray-400 text-sm mt-1">
            {survey.published ? 'リンクを受講生に共有してください' : 'アンケートを公開してリンクを共有してください'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {survey.questions.map((q, qi) => {
            const stats = getAnswerStats(q);
            return (
              <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="font-semibold text-gray-800 text-sm mb-1">Q{qi + 1}. {q.question}</p>
                <p className="text-xs text-gray-400 mb-4">{
                  q.type === 'text' ? 'テキスト入力' :
                  q.type === 'single' ? '単一選択' :
                  q.type === 'multiple' ? '複数選択' : '評価'
                } · {responses.filter((r) => r.answers[q.id] !== undefined).length}件回答</p>

                {stats.type === 'rating' && (
                  <div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <p className="text-4xl font-bold text-indigo-600">{stats.avg}</p>
                      <p className="text-gray-400 text-sm">/ 5.0 ({stats.total}件)</p>
                    </div>
                    <div className="flex items-end gap-2">
                      {[1, 2, 3, 4, 5].map((n) => {
                        const count = stats.dist![n] || 0;
                        const maxCount = Math.max(...Object.values(stats.dist!), 1);
                        return (
                          <div key={n} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-500">{count}</span>
                            <div className="w-full bg-gray-100 rounded-t-sm" style={{ height: '60px' }}>
                              <div className="w-full bg-indigo-500 rounded-t-sm transition-all"
                                style={{ height: `${(count / maxCount) * 60}px`, marginTop: `${60 - (count / maxCount) * 60}px` }} />
                            </div>
                            <span className="text-xs text-gray-400">{n}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {stats.type === 'choice' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const count = stats.counts![opt] || 0;
                      const total = stats.total || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={opt}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">{opt}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{count}件</span>
                              <span className="text-xs font-semibold text-indigo-600 w-8 text-right">{pct}%</span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {stats.type === 'text' && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(stats.values as string[]).map((v, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <p className="text-sm text-gray-700">{v}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
