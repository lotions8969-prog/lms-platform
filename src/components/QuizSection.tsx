'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw } from 'lucide-react';
import { Quiz, QuizQuestion } from '@/lib/types';

interface QuizSectionProps {
  quiz: Quiz;
  onPass: () => void;
}

export default function QuizSection({ quiz, onPass }: QuizSectionProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const question: QuizQuestion = quiz.questions[current];
  const total = quiz.questions.length;

  const correct = showResult ? answers.filter((a, i) => a === quiz.questions[i].answer).length : 0;
  const score = showResult ? Math.round((correct / total) * 100) : 0;
  const passed = showResult && score >= quiz.passingScore;

  // Call onPass in effect to avoid side-effects during render
  useEffect(() => {
    if (passed) onPass();
  }, [passed]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    if (current + 1 < total) {
      setAnswers(newAnswers);
      setCurrent(current + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setAnswers(newAnswers);
      setShowResult(true);
    }
  };

  const handleSubmitAnswer = () => {
    setSubmitted(true);
  };

  const reset = () => {
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setSubmitted(false);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${passed ? 'bg-emerald-900/40' : 'bg-rose-900/40'}`}>
          {passed ? (
            <Trophy className="w-10 h-10 text-emerald-400" />
          ) : (
            <XCircle className="w-10 h-10 text-rose-400" />
          )}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {passed ? '合格おめでとうございます！' : 'もう一度挑戦しましょう'}
        </h3>
        <p className="text-zinc-500 mb-6">
          正解数: {correct}/{total} — スコア: <span className={`font-bold text-xl ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>{score}点</span>
          {' '}（合格ライン: {quiz.passingScore}点）
        </p>

        <div className="space-y-3 mb-8 text-left">
          {quiz.questions.map((q, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${answers[i] === q.answer ? 'bg-emerald-900/20 border border-emerald-900/40' : 'bg-rose-950/20 border border-rose-900/30'}`}>
              {answers[i] === q.answer ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium text-zinc-200">{q.question}</p>
                <p className="text-xs text-zinc-500 mt-1">正解: {q.options[q.answer]}</p>
                {answers[i] !== q.answer && (
                  <p className="text-xs text-rose-400">あなたの回答: {q.options[answers[i]]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {!passed && (
          <button onClick={reset} className="flex items-center gap-2 mx-auto px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-500 transition-colors">
            <RotateCcw className="w-4 h-4" />
            再挑戦する
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-zinc-100">確認テスト</h3>
        <span className="text-sm text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
          {current + 1} / {total}
        </span>
      </div>

      <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-6">
        <div
          className="bg-violet-600 h-1.5 rounded-full transition-all"
          style={{ width: `${((current) / total) * 100}%` }}
        />
      </div>

      <p className="text-base font-medium text-zinc-100 mb-5">{question.question}</p>

      <div className="space-y-3 mb-6">
        {question.options.map((opt, i) => {
          let cls = 'border-zinc-700 hover:border-violet-600 hover:bg-violet-900/10';
          if (selected === i) {
            if (submitted) {
              cls = i === question.answer
                ? 'border-emerald-500 bg-emerald-900/20'
                : 'border-rose-400 bg-rose-950/20';
            } else {
              cls = 'border-violet-500 bg-violet-900/20';
            }
          } else if (submitted && i === question.answer) {
            cls = 'border-emerald-500 bg-emerald-900/20';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${cls}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                  selected === i
                    ? submitted
                      ? i === question.answer ? 'border-emerald-500 text-emerald-400' : 'border-rose-400 text-rose-400'
                      : 'border-violet-500 text-violet-400'
                    : 'border-zinc-600 text-zinc-500'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-zinc-200">{opt}</span>
                {submitted && i === question.answer && (
                  <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        {!submitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selected === null}
            className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            回答する
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-500 transition-colors"
          >
            {current + 1 < total ? '次の問題' : '結果を見る'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
