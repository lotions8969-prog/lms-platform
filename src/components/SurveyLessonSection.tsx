'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, ClipboardList } from 'lucide-react';
import type { Survey } from '@/lib/types';

interface SurveyLessonSectionProps {
  survey: Survey;
  lessonId: string;
  onComplete: () => void;
}

export default function SurveyLessonSection({ survey, lessonId, onComplete }: SurveyLessonSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const setAnswer = (qId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const toggleMultiple = (qId: string, option: string) => {
    const current = (answers[qId] as string[]) || [];
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    setAnswer(qId, next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    for (const q of survey.questions) {
      if (q.required) {
        const ans = answers[q.id];
        if (!ans || (Array.isArray(ans) && ans.length === 0)) {
          setError(`「${q.question}」は必須回答です`);
          return;
        }
      }
    }
    setSubmitting(true);
    const res = await fetch(`/api/surveys/${survey.id}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, lessonId }),
    });
    if (res.ok) {
      setSubmitted(true);
      onComplete();
    } else {
      const d = await res.json();
      setError(d.error || '送信に失敗しました');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">回答を送信しました</h3>
        <p className="text-zinc-500 text-sm">ご協力ありがとうございました</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-violet-400" />
        <h3 className="font-semibold text-zinc-100">{survey.title}</h3>
      </div>
      {survey.description && <p className="text-sm text-zinc-500">{survey.description}</p>}

      {error && (
        <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-900/50 text-rose-400 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {survey.questions.map((q, qi) => (
          <div key={q.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="font-semibold text-zinc-100 text-sm mb-0.5">
              Q{qi + 1}. {q.question}
              {q.required && <span className="text-rose-500 ml-1">*</span>}
            </p>
            <p className="text-xs text-zinc-600 mb-4">
              {q.type === 'text' ? '自由記入' : q.type === 'single' ? '1つ選択' : q.type === 'multiple' ? '複数選択可' : '1〜5で評価'}
            </p>

            {q.type === 'text' && (
              <textarea
                value={(answers[q.id] as string) || ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent resize-none transition-all"
                placeholder="回答を入力..."
              />
            )}

            {q.type === 'single' && q.options && (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                    answers[q.id] === opt ? 'bg-violet-900/30 border border-violet-700' : 'bg-zinc-800 border border-zinc-700 hover:border-zinc-600'
                  }`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      answers[q.id] === opt ? 'border-violet-400 bg-violet-400' : 'border-zinc-500'
                    }`}>
                      {answers[q.id] === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <input type="radio" className="hidden" name={q.id} value={opt} onChange={() => setAnswer(q.id, opt)} />
                    <span className="text-sm text-zinc-200">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'multiple' && q.options && (
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const checked = ((answers[q.id] as string[]) || []).includes(opt);
                  return (
                    <label key={opt} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                      checked ? 'bg-violet-900/30 border border-violet-700' : 'bg-zinc-800 border border-zinc-700 hover:border-zinc-600'
                    }`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        checked ? 'border-violet-400 bg-violet-400' : 'border-zinc-500'
                      }`}>
                        {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleMultiple(q.id, opt)} />
                      <span className="text-sm text-zinc-200">{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === 'rating' && (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const selected = Number(answers[q.id]) === n;
                  return (
                    <button key={n} type="button" onClick={() => setAnswer(q.id, String(n))}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                        selected ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                      }`}>
                      {n}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <button type="submit" disabled={submitting}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/30 disabled:opacity-50">
          {submitting ? '送信中...' : '回答を送信してレッスンを完了'}
        </button>
      </form>
    </div>
  );
}
