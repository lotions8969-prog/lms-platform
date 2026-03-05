'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Submission } from '@/lib/types';
import Navigation from '@/components/Navigation';
import { CheckCircle, XCircle, Clock, MessageSquare, Play } from 'lucide-react';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(query(collection(getFirebaseDb(), 'submissions'), orderBy('createdAt', 'desc')));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Submission));
      setSubmissions(data);
      const initial: Record<string, string> = {};
      data.forEach((s) => { initial[s.id] = s.feedback || ''; });
      setFeedbacks(initial);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    setSaving(id);
    await updateDoc(doc(getFirebaseDb(), 'submissions', id), {
      status,
      feedback: feedbacks[id] || '',
    });
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status, feedback: feedbacks[id] } : s));
    setSaving(null);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      reviewed: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      pending: 'レビュー待ち',
      reviewed: 'レビュー済み',
      approved: '承認',
      rejected: '要再提出',
    };
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filtered = filter === 'all' ? submissions : submissions.filter((s) =>
    filter === 'pending' ? s.status === 'pending' : s.status !== 'pending'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">提出物レビュー</h1>
          <p className="text-gray-500 mt-1">受講生の録画提出物を確認・フィードバック</p>
        </div>

        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'reviewed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'すべて' : f === 'pending' ? 'レビュー待ち' : 'レビュー済み'}
              {f === 'pending' && submissions.filter((s) => s.status === 'pending').length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {submissions.filter((s) => s.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>提出物がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((sub) => (
              <div key={sub.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {statusBadge(sub.status)}
                      <span className="text-xs text-gray-400">ID: {sub.userId.slice(0, 8)}...</span>
                    </div>
                    <p className="text-sm text-gray-500">レッスンID: {sub.lessonId}</p>
                  </div>
                  <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                    <Play className="w-4 h-4" />
                    動画を見る
                  </a>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <MessageSquare className="w-4 h-4" />
                      フィードバック
                    </label>
                    <textarea
                      value={feedbacks[sub.id] || ''}
                      onChange={(e) => setFeedbacks((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="受講生へのフィードバックを入力..."
                    />
                  </div>
                  {sub.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReview(sub.id, 'approved')}
                        disabled={saving === sub.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {saving === sub.id ? '保存中...' : '承認する'}
                      </button>
                      <button
                        onClick={() => handleReview(sub.id, 'rejected')}
                        disabled={saving === sub.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        要再提出
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
