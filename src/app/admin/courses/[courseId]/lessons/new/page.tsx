'use client';

import { useState, useRef, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, Save, AlertCircle, Upload, Link2, Video, Loader2, CheckCircle2, Library, Play, X } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface QuizQuestionInput { question: string; options: string[]; answer: number; }
interface VideoItem { url: string; pathname: string; filename: string; size: number; uploadedAt: string; }

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NewLessonPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [type, setType] = useState<'video' | 'quiz'>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoInputMode, setVideoInputMode] = useState<'upload' | 'library' | 'url'>('upload');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [libraryVideos, setLibraryVideos] = useState<VideoItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [selectedLibraryVideo, setSelectedLibraryVideo] = useState<VideoItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [order, setOrder] = useState(1);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestionInput[]>([{ question: '', options: ['', '', '', ''], answer: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const loadLibrary = async () => {
    if (libraryVideos.length > 0) return;
    setLibraryLoading(true);
    const res = await fetch('/api/videos');
    if (res.ok) setLibraryVideos(await res.json());
    setLibraryLoading(false);
  };

  useEffect(() => {
    if (videoInputMode === 'library') loadLibrary();
  }, [videoInputMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setError('');
    const ext = file.name.split('.').pop() || 'mp4';
    const safeName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9\-_\u3040-\u9FFF]/g, '_');
    const pathname = `lesson-videos/${safeName}_${crypto.randomUUID().slice(0, 8)}.${ext}`;
    try {
      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({ type: 'lesson' }),
        multipart: true,
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      });
      setUploadProgress(100);
      setUploadedVideoUrl(blob.url);
      setUploadedFilename(file.name);
    } catch (err) {
      setUploadError((err as Error).message || 'アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const finalVideoUrl =
    videoInputMode === 'upload' ? uploadedVideoUrl :
    videoInputMode === 'library' ? (selectedLibraryVideo?.url || '') :
    videoUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (type === 'video' && !finalVideoUrl) { setError('動画を選択するかURLを入力してください'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId, type, title,
          description: description || undefined,
          videoUrl: type === 'video' ? finalVideoUrl : undefined,
          order,
          questions: type === 'quiz' ? questions : undefined,
          passingScore,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'エラーが発生しました'); setLoading(false); return; }
      router.replace(`/admin/courses/${courseId}/lessons`);
    } catch {
      setError('ネットワークエラーが発生しました');
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider";

  return (
    <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
      <Link href={`/admin/courses/${courseId}/lessons`} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />レッスン一覧に戻る
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-xl font-bold text-white mb-7">新しいレッスンを追加</h1>

        {error && (
          <div className="flex items-start gap-2 bg-rose-950/40 border border-rose-900/50 text-rose-400 px-4 py-3 rounded-xl text-sm mb-5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>レッスンタイプ</label>
            <div className="flex gap-3">
              {(['video', 'quiz'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    type === t ? 'border-violet-600 bg-violet-900/30 text-violet-300' : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}>
                  {t === 'video' ? '🎬 動画レッスン' : '📝 クイズ'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>タイトル <span className="text-rose-500 normal-case">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} placeholder="例：第1回 はじめてのレッスン" />
          </div>

          <div>
            <label className={labelCls}>説明 <span className="text-zinc-600 normal-case font-normal">(任意)</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>表示順</label>
            <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={1}
              className="w-24 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all" />
          </div>

          {type === 'video' && (
            <div>
              <label className={labelCls}>動画 <span className="text-rose-500 normal-case">*</span></label>
              <div className="flex gap-2 mb-3 flex-wrap">
                {([
                  { mode: 'upload', icon: Upload, label: 'アップロード' },
                  { mode: 'library', icon: Library, label: 'ライブラリ' },
                  { mode: 'url', icon: Link2, label: 'URL入力' },
                ] as const).map(({ mode, icon: Icon, label }) => (
                  <button key={mode} type="button" onClick={() => setVideoInputMode(mode)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      videoInputMode === mode ? 'bg-violet-600 text-white border-violet-600' : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }`}>
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>

              {videoInputMode === 'upload' && (
                <div>
                  {uploadError && <div className="flex items-start gap-2 bg-rose-950/40 border border-rose-900/50 text-rose-400 text-sm px-3 py-2 rounded-xl mb-3"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{uploadError}</div>}
                  {!uploadedVideoUrl ? (
                    <div onClick={() => !uploading && fileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-violet-700 hover:bg-violet-900/5 transition-all">
                      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
                      {uploading ? (
                        <div className="space-y-3">
                          <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
                          <p className="text-sm text-zinc-400">アップロード中... {uploadProgress}%</p>
                          <div className="w-full bg-zinc-800 rounded-full h-1.5 max-w-xs mx-auto">
                            <div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Video className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                          <p className="text-sm font-medium text-zinc-400">クリックして動画を選択</p>
                          <p className="text-xs text-zinc-700 mt-1">MP4, MOV, AVI, WebM（最大500MB）</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="border border-emerald-900/50 bg-emerald-950/20 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{uploadedFilename}</p>
                          <p className="text-xs text-emerald-500">アップロード完了</p>
                        </div>
                        <button type="button" onClick={() => { setUploadedVideoUrl(''); setUploadedFilename(''); setUploadError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="text-xs text-zinc-500 hover:text-rose-400 underline shrink-0 transition-colors">変更</button>
                      </div>
                      <video src={uploadedVideoUrl} controls className="w-full rounded-lg max-h-40 bg-black" />
                    </div>
                  )}
                </div>
              )}

              {videoInputMode === 'library' && (
                <div>
                  {selectedLibraryVideo ? (
                    <div className="border border-violet-900/50 bg-violet-950/20 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{selectedLibraryVideo.filename}</p>
                          <p className="text-xs text-violet-400">ライブラリから選択中</p>
                        </div>
                        <button type="button" onClick={() => setSelectedLibraryVideo(null)} className="text-xs text-zinc-500 hover:text-rose-400 underline shrink-0">変更</button>
                      </div>
                      <video src={selectedLibraryVideo.url} controls className="w-full rounded-lg max-h-40 bg-black" />
                    </div>
                  ) : libraryLoading ? (
                    <div className="flex items-center justify-center py-12 text-zinc-600"><Loader2 className="w-6 h-6 animate-spin mr-2" />読み込み中...</div>
                  ) : libraryVideos.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-600">
                      <Video className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">動画ライブラリに動画がありません</p>
                    </div>
                  ) : (
                    <div className="border border-zinc-800 rounded-xl overflow-hidden">
                      <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800">
                        {libraryVideos.map((v) => (
                          <button key={v.url} type="button" onClick={() => setSelectedLibraryVideo(v)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left group">
                            <div className="relative w-20 h-12 bg-black rounded-lg overflow-hidden shrink-0">
                              <video src={v.url} className="w-full h-full object-cover" preload="metadata" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-200 truncate">{v.filename}</p>
                              <p className="text-xs text-zinc-600">{formatBytes(v.size)}</p>
                            </div>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewVideo(v); }}
                              className="p-1.5 text-zinc-600 hover:text-violet-400 rounded-lg transition-colors shrink-0">
                              <Play className="w-4 h-4" />
                            </button>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {videoInputMode === 'url' && (
                <div>
                  <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={inputCls} placeholder="https://example.com/video.mp4" />
                  <p className="text-xs text-zinc-600 mt-1.5">MP4/WebM ファイルのURL</p>
                </div>
              )}
            </div>
          )}

          {type === 'quiz' && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>合格ライン（%）</label>
                <input type="number" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} min={1} max={100}
                  className="w-24 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all" />
              </div>
              <div className="border-t border-zinc-800 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-zinc-200 text-sm">問題一覧</h3>
                  <button type="button" onClick={() => setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: 0 }])}
                    className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium">
                    <Plus className="w-4 h-4" />問題を追加
                  </button>
                </div>
                {questions.map((q, qi) => (
                  <div key={qi} className="border border-zinc-800 bg-zinc-900/50 rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-400">問題 {qi + 1}</span>
                      {questions.length > 1 && (
                        <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qi))} className="text-zinc-700 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                    <input type="text" value={q.question}
                      onChange={(e) => { const u = [...questions]; u[qi].question = e.target.value; setQuestions(u); }}
                      required placeholder="問題文を入力"
                      className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all" />
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" name={`answer-${qi}`} checked={q.answer === oi}
                          onChange={() => { const u = [...questions]; u[qi].answer = oi; setQuestions(u); }}
                          className="accent-violet-500" />
                        <input type="text" value={opt}
                          onChange={(e) => { const u = [...questions]; u[qi].options[oi] = e.target.value; setQuestions(u); }}
                          required placeholder={`選択肢 ${String.fromCharCode(65 + oi)}`}
                          className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all" />
                      </div>
                    ))}
                    <p className="text-xs text-zinc-700">ラジオボタンで正解を選択してください</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading || uploading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/30 disabled:opacity-50">
            <Save className="w-4 h-4" />{loading ? '保存中...' : 'レッスンを保存'}
          </button>
        </form>
      </div>

      {previewVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setPreviewVideo(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <p className="font-medium text-zinc-200 truncate pr-4">{previewVideo.filename}</p>
              <button onClick={() => setPreviewVideo(null)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <video src={previewVideo.url} controls autoPlay className="w-full aspect-video bg-black" />
            <div className="p-4 flex justify-end gap-3">
              <button onClick={() => setPreviewVideo(null)} className="px-4 py-2 text-sm border border-zinc-700 text-zinc-400 rounded-xl hover:bg-zinc-800 transition-colors">閉じる</button>
              <button onClick={() => { setSelectedLibraryVideo(previewVideo); setPreviewVideo(null); }}
                className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-all">この動画を使用する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
