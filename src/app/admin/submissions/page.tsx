'use client';

import { useEffect, useState } from 'react';
import { Submission } from '@/lib/types';
import { CheckCircle, XCircle, Clock, MessageSquare, ExternalLink } from 'lucide-react';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');

  useEffect(() => {
    fetch('/api/submissions').then((r) => r.json()).then((data) => {
      setSubmissions(data);
      const init: Record<string, string> = {};
      data.forEach((s: Submission) => { init[s.id] = s.feedback || ''; });
      setFeedbacks(init);
      setLoading(false);
    });
  }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    setSaving(id);
    await fetch(`/api/submissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, feedback: feedbacks[id] || '' }),
    });
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status, feedback: feedbacks[id] } : s));
    setSaving(null);
  };

  const badgeCls: Record<string, string> = {
    pending: 'bg-amber-900/30 text-amber-400 border-amber-800/40',
    approved: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40',
    rejected: 'bg-rose-900/30 text-rose-400 border-rose-800/40',
  };
  const badgeLabel: Record<string, string> = { pending: 'レビュー待ち', approved: '承認済み', rejected: '要再提出' };

  const filtered = filter === 'all' ? submissions
    : submissions.filter((s) => filter === 'pending' ? s.status === 'pending' : s.status !== 'pending');
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">提出物レビュー</h1>
        <p className="text-zinc-500 text-sm mt-1">{submissions.length}件の提出 · {pendingCount > 0 ? <span className="text-amber-400">{pendingCount}件未処理</span> : '未処理なし'}</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'reviewed'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}>
            {f === 'all' ? 'すべて' : f === 'pending' ? 'レビュー待ち' : 'レビュー済み'}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-zinc-900 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <Clock className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500">提出物がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <div key={sub.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${badgeCls[sub.status] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                    {badgeLabel[sub.status] || sub.status}
                  </span>
                  <p className="text-xs text-zinc-600">{new Date(sub.createdAt).toLocaleDateString('ja-JP')}</p>
                </div>
                <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />動画を見る
                </a>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5" />フィードバック
                </label>
                <textarea
                  value={feedbacks[sub.id] || ''}
                  onChange={(e) => setFeedbacks((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent resize-none transition-all"
                  placeholder="受講生へのフィードバックを入力..."
                />
                {sub.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleReview(sub.id, 'approved')} disabled={saving === sub.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all">
                      <CheckCircle className="w-4 h-4" />{saving === sub.id ? '保存中...' : '承認する'}
                    </button>
                    <button onClick={() => handleReview(sub.id, 'rejected')} disabled={saving === sub.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all">
                      <XCircle className="w-4 h-4" />要再提出
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
