'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, Save, Globe, EyeOff, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface QuestionInput {
  id: string;
  type: 'text' | 'single' | 'multiple' | 'rating';
  question: string;
  options: string[];
  required: boolean;
}

export default function NewSurveyPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(false);
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { id: uuidv4(), type: 'single', question: '', options: ['', ''], required: true },
  ]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addQuestion = (type: QuestionInput['type']) => {
    setQuestions([...questions, {
      id: uuidv4(), type, question: '',
      options: type === 'text' || type === 'rating' ? [] : ['', ''],
      required: true,
    }]);
  };

  const removeQuestion = (id: string) => setQuestions(questions.filter((q) => q.id !== id));

  const updateQuestion = (id: string, field: keyof QuestionInput, value: unknown) => {
    setQuestions(questions.map((q) => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId: string, idx: number, value: string) => {
    setQuestions(questions.map((q) => {
      if (q.id !== qId) return q;
      const opts = [...q.options];
      opts[idx] = value;
      return { ...q, options: opts };
    }));
  };

  const addOption = (qId: string) => {
    setQuestions(questions.map((q) => q.id !== qId ? q : { ...q, options: [...q.options, ''] }));
  };

  const removeOption = (qId: string, idx: number) => {
    setQuestions(questions.map((q) => {
      if (q.id !== qId) return q;
      return { ...q, options: q.options.filter((_, i) => i !== idx) };
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, questions, published }),
    });
    const survey = await res.json();
    router.replace(`/admin/surveys/${survey.id}`);
  };

  const inputCls = "w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider";

  const typeLabels = { text: 'テキスト入力', single: '単一選択', multiple: '複数選択', rating: '評価（1〜5）' };

  return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
      <Link href="/admin/surveys" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />アンケート一覧
      </Link>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Survey meta */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h1 className="text-xl font-bold text-white mb-6">新しいアンケートを作成</h1>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>タイトル <span className="text-rose-500 normal-case">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} placeholder="例：コース満足度アンケート" />
            </div>
            <div>
              <label className={labelCls}>説明 <span className="text-zinc-600 normal-case font-normal">(任意)</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                className={`${inputCls} resize-none`} placeholder="アンケートの目的や対象者など" />
            </div>
            <div className="border border-zinc-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">公開設定</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{published ? '受講生が回答できます' : '下書き'}</p>
                </div>
                <button type="button" onClick={() => setPublished(!published)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${published ? 'bg-violet-600' : 'bg-zinc-700'}`}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${published ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {published
                  ? <><Globe className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-medium">公開中</span></>
                  : <><EyeOff className="w-3.5 h-3.5 text-zinc-600" /><span className="text-xs text-zinc-600">下書き</span></>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {questions.map((q, qi) => (
            <div key={q.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-zinc-700" />
                  <span className="text-sm font-semibold text-zinc-300">質問 {qi + 1}</span>
                  <select value={q.type} onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                    className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-600 transition-all">
                    {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer">
                    <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                      className="accent-violet-500" />
                    必須
                  </label>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(q.id)} className="text-zinc-700 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <input type="text" value={q.question}
                onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                required placeholder="質問文を入力..."
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all mb-3" />

              {(q.type === 'single' || q.type === 'multiple') && (
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <div className={`w-4 h-4 border-2 border-zinc-600 shrink-0 ${q.type === 'single' ? 'rounded-full' : 'rounded'}`} />
                      <input type="text" value={opt}
                        onChange={(e) => updateOption(q.id, oi, e.target.value)}
                        placeholder={`選択肢 ${oi + 1}`}
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-600 transition-all" />
                      {q.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(q.id, oi)} className="text-zinc-700 hover:text-rose-400 transition-colors shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(q.id)}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors mt-1">
                    <Plus className="w-3.5 h-3.5" />選択肢を追加
                  </button>
                </div>
              )}

              {q.type === 'rating' && (
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-500 text-sm font-medium">{n}</div>
                  ))}
                  <span className="text-xs text-zinc-600 ml-2">1〜5の評価</span>
                </div>
              )}

              {q.type === 'text' && (
                <div className="h-10 bg-zinc-800 border border-zinc-700 border-dashed rounded-xl flex items-center px-4">
                  <span className="text-xs text-zinc-600">テキスト入力欄</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add question buttons */}
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-4">
          <p className="text-xs text-zinc-600 mb-3 font-medium uppercase tracking-wider">質問を追加</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeLabels).map(([type, label]) => (
              <button key={type} type="button" onClick={() => addQuestion(type as QuestionInput['type'])}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors">
                <Plus className="w-3 h-3" />{label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/30 disabled:opacity-50">
          <Save className="w-4 h-4" />{loading ? '作成中...' : 'アンケートを作成'}
        </button>
      </form>
    </div>
  );
}
