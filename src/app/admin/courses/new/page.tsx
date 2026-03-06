'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Globe, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function NewCoursePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, thumbnail: thumbnail || undefined, published }),
    });
    const course = await res.json();
    router.replace(`/admin/courses/${course.id}/lessons/new`);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" />コース管理に戻る
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-7">新しいコースを作成</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">コース名 <span className="text-rose-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                placeholder="例：Pythonプログラミング入門" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">説明 <span className="text-rose-500">*</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all resize-none"
                placeholder="このコースで学べること、対象者、ゴールなどを説明してください" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">サムネイルURL <span className="text-zinc-600 normal-case">(任意)</span></label>
              <input type="text" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                placeholder="https://example.com/image.jpg" />
            </div>

            {/* Publish toggle */}
            <div className="border border-zinc-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">公開設定</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{published ? '受講生にこのコースが表示されます' : '下書き — 受講生には表示されません'}</p>
                </div>
                <button type="button" onClick={() => setPublished(!published)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${published ? 'bg-violet-600' : 'bg-zinc-700'}`}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${published ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                {published
                  ? <><Globe className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400 font-medium">公開中</span></>
                  : <><EyeOff className="w-3.5 h-3.5 text-zinc-600" /><span className="text-xs text-zinc-600">下書き（後から公開できます）</span></>
                }
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/30 disabled:opacity-50">
              <Save className="w-4 h-4" />
              {loading ? '作成中...' : 'コースを作成してレッスンを追加 →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
