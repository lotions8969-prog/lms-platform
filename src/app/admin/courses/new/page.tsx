'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { ChevronLeft, Save, Globe, EyeOff, ImageIcon, Upload, Loader2, X, Link2 } from 'lucide-react';
import Link from 'next/link';

export default function NewCoursePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailMode, setThumbnailMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('画像ファイルを選択してください（JPG, PNG, WebP）');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    const ext = file.name.split('.').pop() || 'jpg';
    const safeName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9\-_]/g, '_');
    const pathname = `thumbnails/${safeName}_${crypto.randomUUID().slice(0, 8)}.${ext}`;
    try {
      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({ type: 'thumbnail' }),
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      });
      setThumbnailUrl(blob.url);
    } catch (err) {
      setUploadError((err as Error).message || 'アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, thumbnail: thumbnailUrl || undefined, published }),
    });
    const course = await res.json();
    router.replace(`/admin/courses/${course.id}/lessons/new`);
  };

  const inputCls = "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";

  return (
    <div className="px-4 sm:px-8 py-8 max-w-2xl mx-auto">
      <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />コース管理に戻る
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-7">新しいコースを作成</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>コース名 <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
              className={inputCls} placeholder="例：Pythonプログラミング入門" />
          </div>

          <div>
            <label className={labelCls}>説明 <span className="text-red-500">*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
              className={`${inputCls} resize-none`}
              placeholder="このコースで学べること、対象者、ゴールなどを説明してください" />
          </div>

          {/* Thumbnail */}
          <div>
            <label className={labelCls}>サムネイル画像 <span className="text-gray-400 font-normal">（任意）</span></label>

            {/* Mode switcher */}
            <div className="flex gap-2 mb-3">
              {([
                { mode: 'upload', icon: Upload, label: '画像をアップロード' },
                { mode: 'url', icon: Link2, label: 'URLで指定' },
              ] as const).map(({ mode, icon: Icon, label }) => (
                <button key={mode} type="button" onClick={() => setThumbnailMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    thumbnailMode === mode ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>

            {thumbnailMode === 'upload' && (
              <div>
                {uploadError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg mb-3">{uploadError}</div>
                )}
                {thumbnailUrl ? (
                  <div className="border border-emerald-200 bg-emerald-50 rounded-xl overflow-hidden">
                    <div className="relative">
                      <img src={thumbnailUrl} alt="thumbnail preview" className="w-full h-48 object-cover" />
                      <button type="button"
                        onClick={() => { setThumbnailUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors">
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs text-emerald-600 font-medium">アップロード完了</span>
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">変更する</button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      uploading ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                    }`}>
                    {uploading ? (
                      <div className="space-y-3">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                        <p className="text-sm text-gray-600">アップロード中... {uploadProgress}%</p>
                        <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">クリックして画像を選択</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP（最大10MB）</p>
                        <p className="text-xs text-gray-400">推奨サイズ: 16:9（1280×720 など）</p>
                      </>
                    )}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
              </div>
            )}

            {thumbnailMode === 'url' && (
              <div>
                <input type="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)}
                  className={inputCls} placeholder="https://example.com/thumbnail.jpg" />
                {thumbnailUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                    <img src={thumbnailUrl} alt="preview" className="w-full h-40 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Publish toggle */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">公開設定</p>
                <p className="text-xs text-gray-500 mt-0.5">{published ? '受講生にこのコースが表示されます' : '下書き — 受講生には表示されません'}</p>
              </div>
              <button type="button" onClick={() => setPublished(!published)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${published ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${published ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {published
                ? <><Globe className="w-3.5 h-3.5 text-emerald-500" /><span className="text-xs text-emerald-600 font-medium">公開中</span></>
                : <><EyeOff className="w-3.5 h-3.5 text-gray-400" /><span className="text-xs text-gray-400">下書き（後から公開できます）</span></>
              }
            </div>
          </div>

          <button type="submit" disabled={loading || uploading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm disabled:opacity-50">
            <Save className="w-4 h-4" />
            {loading ? '作成中...' : 'コースを作成してレッスンを追加 →'}
          </button>
        </form>
      </div>
    </div>
  );
}
