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
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">回答を送信しました</h3>
        <p className="text-gray-500 text-sm">ご協力ありがとうございました</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-violet-500" />
        <h3 className="font-semibold text-gray-800">{survey.title}</h3>
      </div>
      {survey.description && <p className="text-sm text-gray-500">{survey.description}</p>}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {survey.questions.map((q, qi) => (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="font-semibold text-gray-800 text-sm mb-0.5">
              Q{qi + 1}. {q.question}
              {q.required && <span className="text-red-500 ml-1">*</span>}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {q.type === 'text' ? '自由記入' : q.type === 'single' ? '1つ選択' : q.type === 'multiple' ? '複数選択可' : '1〜5で評価'}
            </p>

            {q.type === 'text' && (
              <textarea
                value={(answers[q.id] as string) || ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-all"
                placeholder="回答を入力..."
              />
            )}

            {q.type === 'single' && q.options && (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                    answers[q.id] === opt ? 'bg-violet-50 border border-violet-300' : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      answers[q.id] === opt ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                    }`}>
                      {answers[q.id] === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <input type="radio" className="hidden" name={q.id} value={opt} onChange={() => setAnswer(q.id, opt)} />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'multiple' && q.options && (
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const checked = ((answers[q.id] as string[]) || []).includes(opt);
                  return (
                    <label key={opt} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                      checked ? 'bg-violet-50 border border-violet-300' : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        checked ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                      }`}>
                        {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleMultiple(q.id, opt)} />
                      <span className="text-sm text-gray-700">{opt}</span>
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
                      className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                        selected ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
          className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50">
          {submitting ? '送信中...' : '回答を送信してレッスンを完了'}
        </button>
      </form>
    </div>
  );
}
