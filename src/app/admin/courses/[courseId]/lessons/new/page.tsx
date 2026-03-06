'use client';

import { useState, useRef } from 'react';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, Save, AlertCircle, Upload, Link2, Video, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface QuizQuestionInput { question: string; options: string[]; answer: number; }

export default function NewLessonPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [type, setType] = useState<'video' | 'quiz'>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoInputMode, setVideoInputMode] = useState<'url' | 'upload'>('upload');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [order, setOrder] = useState(1);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestionInput[]>([{ question: '', options: ['', '', '', ''], answer: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'lesson');
      formData.append('name', file.name);

      // Simulate progress since fetch doesn't support progress events
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 8, 85));
      }, 300);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      clearInterval(progressInterval);

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'アップロードに失敗しました');
        setUploading(false);
        return;
      }
      const { url, filename } = await res.json();
      setUploadProgress(100);
      setUploadedVideoUrl(url);
      setUploadedFilename(filename || file.name);
    } catch {
      setError('アップロード中にエラーが発生しました');
    } finally {
      setUploading(false);
    }
  };

  const finalVideoUrl = videoInputMode === 'upload' ? uploadedVideoUrl : videoUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (type === 'video' && !finalVideoUrl) {
      setError('動画を選択するかURLを入力してください');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          type,
          title,
          description: description || undefined,
          videoUrl: type === 'video' ? finalVideoUrl : undefined,
          order,
          questions: type === 'quiz' ? questions : undefined,
          passingScore,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || `エラーが発生しました (${res.status})`);
        setLoading(false);
        return;
      }
      router.replace(`/admin/courses/${courseId}/lessons`);
    } catch {
      setError('ネットワークエラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href={`/admin/courses/${courseId}/lessons`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />レッスン一覧に戻る
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">新しいレッスンを追加</h1>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Lesson Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">レッスンタイプ</label>
              <div className="flex gap-3">
                {(['video', 'quiz'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${type === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                    {t === 'video' ? '🎬 動画レッスン' : '📝 クイズ'}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">タイトル <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="例：第1回 はじめてのレッスン" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">説明（任意）</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">表示順</label>
              <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={1}
                className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Video section */}
            {type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">動画 <span className="text-red-500">*</span></label>
                <div className="flex gap-2 mb-3">
                  <button type="button" onClick={() => { setVideoInputMode('upload'); setVideoUrl(''); }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${videoInputMode === 'upload' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    <Upload className="w-4 h-4" />ファイルアップロード
                  </button>
                  <button type="button" onClick={() => { setVideoInputMode('url'); setUploadedVideoUrl(''); setUploadedFilename(''); }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${videoInputMode === 'url' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    <Link2 className="w-4 h-4" />URLを入力
                  </button>
                </div>

                {videoInputMode === 'upload' ? (
                  <div>
                    {!uploadedVideoUrl ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        {uploading ? (
                          <div className="space-y-3">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                            <p className="text-sm text-gray-600">アップロード中... {uploadProgress}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        ) : (
                          <>
                            <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700">クリックして動画を選択</p>
                            <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI, WebM など対応</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{uploadedFilename}</p>
                            <p className="text-xs text-green-600">アップロード完了</p>
                          </div>
                          <button type="button" onClick={() => { setUploadedVideoUrl(''); setUploadedFilename(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="text-xs text-gray-500 hover:text-red-500 underline shrink-0">
                            変更
                          </button>
                        </div>
                        <video src={uploadedVideoUrl} controls className="w-full rounded-lg max-h-40 bg-black" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="https://example.com/video.mp4" />
                    <p className="text-xs text-gray-400 mt-1">MP4/WebM ファイルのURL、またはYouTube埋め込みURLを入力</p>
                  </div>
                )}
              </div>
            )}

            {/* Quiz section */}
            {type === 'quiz' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">合格ライン（%）</label>
                  <input type="number" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} min={1} max={100}
                    className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-800">問題一覧</h3>
                    <button type="button" onClick={() => setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: 0 }])}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                      <Plus className="w-4 h-4" />問題を追加
                    </button>
                  </div>
                  {questions.map((q, qi) => (
                    <div key={qi} className="border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">問題 {qi + 1}</span>
                        {questions.length > 1 && (
                          <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qi))} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input type="text" value={q.question}
                        onChange={(e) => { const u = [...questions]; u[qi].question = e.target.value; setQuestions(u); }}
                        required placeholder="問題文を入力"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`answer-${qi}`} checked={q.answer === oi}
                            onChange={() => { const u = [...questions]; u[qi].answer = oi; setQuestions(u); }}
                            className="accent-blue-600" />
                          <input type="text" value={opt}
                            onChange={(e) => { const u = [...questions]; u[qi].options[oi] = e.target.value; setQuestions(u); }}
                            required placeholder={`選択肢 ${String.fromCharCode(65 + oi)}`}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      ))}
                      <p className="text-xs text-gray-400">ラジオボタンで正解を選択してください</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading || uploading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              {loading ? '保存中...' : 'レッスンを保存'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
