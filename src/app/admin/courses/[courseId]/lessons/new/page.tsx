'use client';

import { useState, useRef, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, Save, AlertCircle, Upload, Link2, Video, Loader2, CheckCircle2, Library, Play, X, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface QuizQuestionInput { question: string; options: string[]; answer: number; }
interface VideoItem { url: string; pathname: string; filename: string; size: number; uploadedAt: string; }
interface SurveyItem { id: string; title: string; published: boolean; }

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NewLessonPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [type, setType] = useState<'video' | 'quiz' | 'survey'>('video');
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
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState('');
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

  useEffect(() => {
    if (type === 'survey' && surveys.length === 0) {
      fetch('/api/surveys').then((r) => r.json()).then((d) => setSurveys(d));
    }
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (type === 'survey' && !selectedSurveyId) { setError('アンケートを選択してください'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId, type, title,
          description: description || undefined,
          videoUrl: type === 'video' ? finalVideoUrl : undefined,
          surveyId: type === 'survey' ? selectedSurveyId : undefined,
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

  const inputCls = "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-2";

  return (
    <div className="px-4 sm:px-8 py-8 max-w-2xl mx-auto">
      <Link href={`/admin/courses/${courseId}/lessons`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />レッスン一覧に戻る
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-7">新しいレッスンを追加</h1>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type selector */}
          <div>
            <label className={labelCls}>レッスンタイプ</label>
            <div className="flex gap-3 flex-wrap">
              {([
                { value: 'video', label: '動画レッスン' },
                { value: 'quiz', label: 'クイズ' },
                { value: 'survey', label: 'アンケート' },
              ] as const).map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setType(value)}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                    type === value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>タイトル <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} placeholder="例：第1回 はじめてのレッスン" />
          </div>

          <div>
            <label className={labelCls}>説明 <span className="text-gray-400 font-normal">（任意）</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>表示順</label>
            <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={1}
              className="w-24 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>

          {/* Video input */}
          {type === 'video' && (
            <div>
              <label className={labelCls}>動画 <span className="text-red-500">*</span></label>
              <div className="flex gap-2 mb-3 flex-wrap">
                {([
                  { mode: 'upload', icon: Upload, label: 'アップロード' },
                  { mode: 'library', icon: Library, label: 'ライブラリ' },
                  { mode: 'url', icon: Link2, label: 'URL入力' },
                ] as const).map(({ mode, icon: Icon, label }) => (
                  <button key={mode} type="button" onClick={() => setVideoInputMode(mode)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      videoInputMode === mode ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}>
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>

              {videoInputMode === 'upload' && (
                <div>
                  {uploadError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{uploadError}
                    </div>
                  )}
                  {!uploadedVideoUrl ? (
                    <div onClick={() => !uploading && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        uploading ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                      }`}>
                      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
                      {uploading ? (
                        <div className="space-y-3">
                          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
                          <p className="text-sm text-gray-600">アップロード中... {uploadProgress}%</p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-xs mx-auto">
                            <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500">クリックして動画を選択</p>
                          <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI, WebM（最大500MB）</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{uploadedFilename}</p>
                          <p className="text-xs text-emerald-600">アップロード完了</p>
                        </div>
                        <button type="button" onClick={() => { setUploadedVideoUrl(''); setUploadedFilename(''); setUploadError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="text-xs text-gray-500 hover:text-red-500 underline shrink-0 transition-colors">変更</button>
                      </div>
                      <video src={uploadedVideoUrl} controls className="w-full rounded-lg max-h-40 bg-black" />
                    </div>
                  )}
                </div>
              )}

              {videoInputMode === 'library' && (
                <div>
                  {selectedLibraryVideo ? (
                    <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{selectedLibraryVideo.filename}</p>
                          <p className="text-xs text-indigo-600">ライブラリから選択中</p>
                        </div>
                        <button type="button" onClick={() => setSelectedLibraryVideo(null)} className="text-xs text-gray-500 hover:text-red-500 underline shrink-0">変更</button>
                      </div>
                      <video src={selectedLibraryVideo.url} controls className="w-full rounded-lg max-h-40 bg-black" />
                    </div>
                  ) : libraryLoading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />読み込み中...
                    </div>
                  ) : libraryVideos.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                      <Video className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                      <p className="text-sm">動画ライブラリに動画がありません</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                        {libraryVideos.map((v) => (
                          <button key={v.url} type="button" onClick={() => setSelectedLibraryVideo(v)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group">
                            <div className="relative w-20 h-12 bg-black rounded-lg overflow-hidden shrink-0">
                              <video src={v.url} className="w-full h-full object-cover" preload="metadata" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">{v.filename}</p>
                              <p className="text-xs text-gray-400">{formatBytes(v.size)}</p>
                            </div>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewVideo(v); }}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors shrink-0">
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
                  <p className="text-xs text-gray-400 mt-1.5">MP4/WebM ファイルのURL</p>
                </div>
              )}
            </div>
          )}

          {/* Quiz */}
          {type === 'quiz' && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>合格ライン（%）</label>
                <input type="number" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} min={1} max={100}
                  className="w-24 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 text-sm">問題一覧</h3>
                  <button type="button" onClick={() => setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: 0 }])}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors font-medium">
                    <Plus className="w-4 h-4" />問題を追加
                  </button>
                </div>
                {questions.map((q, qi) => (
                  <div key={qi} className="border border-gray-200 bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">問題 {qi + 1}</span>
                      {questions.length > 1 && (
                        <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qi))} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input type="text" value={q.question}
                      onChange={(e) => { const u = [...questions]; u[qi].question = e.target.value; setQuestions(u); }}
                      required placeholder="問題文を入力"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" name={`answer-${qi}`} checked={q.answer === oi}
                          onChange={() => { const u = [...questions]; u[qi].answer = oi; setQuestions(u); }}
                          className="accent-indigo-600" />
                        <input type="text" value={opt}
                          onChange={(e) => { const u = [...questions]; u[qi].options[oi] = e.target.value; setQuestions(u); }}
                          required placeholder={`選択肢 ${String.fromCharCode(65 + oi)}`}
                          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                      </div>
                    ))}
                    <p className="text-xs text-gray-400">ラジオボタンで正解を選択してください</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Survey */}
          {type === 'survey' && (
            <div>
              <label className={labelCls}>
                <ClipboardList className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                アンケートを選択 <span className="text-red-500">*</span>
              </label>
              {surveys.length === 0 ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />読み込み中...
                </div>
              ) : (
                <div className="space-y-2">
                  {surveys.map((s) => (
                    <label key={s.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                      selectedSurveyId === s.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedSurveyId === s.id ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                      }`}>
                        {selectedSurveyId === s.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <input type="radio" className="hidden" name="surveyId" value={s.id} onChange={() => setSelectedSurveyId(s.id)} />
                      <span className="text-sm font-medium text-gray-700 flex-1">{s.title}</span>
                      {!s.published && <span className="text-[10px] bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">下書き</span>}
                    </label>
                  ))}
                  <p className="text-xs text-gray-400 mt-1">
                    アンケートがない場合は先に
                    <a href="/admin/surveys/new" target="_blank" className="text-indigo-600 hover:text-indigo-700 ml-1 underline">アンケートを作成</a>
                    してください
                  </p>
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={loading || uploading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm disabled:opacity-50">
            <Save className="w-4 h-4" />{loading ? '保存中...' : 'レッスンを保存'}
          </button>
        </form>
      </div>

      {previewVideo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreviewVideo(null)}>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden max-w-2xl w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="font-medium text-gray-800 truncate pr-4">{previewVideo.filename}</p>
              <button onClick={() => setPreviewVideo(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <video src={previewVideo.url} controls autoPlay className="w-full aspect-video bg-black" />
            <div className="p-4 flex justify-end gap-3">
              <button onClick={() => setPreviewVideo(null)} className="px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">閉じる</button>
              <button onClick={() => { setSelectedLibraryVideo(previewVideo); setPreviewVideo(null); }}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all">この動画を使用する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
