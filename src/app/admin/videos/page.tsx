'use client';

import { useEffect, useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { Video, Trash2, Upload, Play, X, Loader2, FileVideo, CheckCircle2 } from 'lucide-react';

interface VideoItem {
  url: string;
  pathname: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVideos = async () => {
    const res = await fetch('/api/videos');
    if (res.ok) setVideos(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setUploadError('動画ファイルを選択してください');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setUploadedName(file.name);
    setUploadError('');

    const ext = file.name.split('.').pop() || 'mp4';
    const safeName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9\-_\u3040-\u9FFF]/g, '_');
    const pathname = `lesson-videos/${safeName}_${crypto.randomUUID().slice(0, 8)}.${ext}`;

    try {
      await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({ type: 'lesson' }),
        multipart: true,
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      });
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchVideos();
      }, 800);
    } catch (err) {
      setUploadError((err as Error).message || 'アップロードに失敗しました');
      setUploading(false);
    }
  };

  const handleDelete = async (video: VideoItem) => {
    if (!confirm(`「${video.filename}」を削除しますか？`)) return;
    await fetch('/api/videos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: video.url }),
    });
    setVideos((prev) => prev.filter((v) => v.url !== video.url));
    if (previewVideo?.url === video.url) setPreviewVideo(null);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileVideo className="w-6 h-6 text-violet-400" />動画ライブラリ
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{videos.length}件の動画</p>
        </div>
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/20">
          <Upload className="w-4 h-4" />動画をアップロード
        </button>
        <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>

      <div
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 mb-8 text-center transition-all cursor-pointer ${
          uploading ? 'border-violet-700 bg-violet-900/10' : 'border-zinc-800 hover:border-violet-700 hover:bg-violet-900/5'
        }`}
      >
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
            <p className="text-sm text-zinc-300 font-medium">「{uploadedName}」をアップロード中... {uploadProgress}%</p>
            {uploadProgress === 100 && <p className="text-xs text-emerald-400 flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" />完了！</p>}
            <div className="w-full max-w-xs mx-auto bg-zinc-800 rounded-full h-1.5">
              <div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">クリックまたはドラッグ＆ドロップで動画をアップロード</p>
            <p className="text-xs text-zinc-700 mt-1">MP4, MOV, AVI, WebM 対応（最大500MB）</p>
          </>
        )}
      </div>

      {uploadError && (
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 text-sm px-4 py-3 rounded-xl mb-6">{uploadError}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-zinc-900 rounded-2xl h-64 animate-pulse" />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <Video className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>動画がまだアップロードされていません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video.url} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all">
              <div className="relative bg-black aspect-video cursor-pointer group" onClick={() => setPreviewVideo(video)}>
                <video src={video.url} className="w-full h-full object-contain" preload="metadata" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="font-medium text-zinc-200 text-sm truncate">{video.filename}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-zinc-600">{formatBytes(video.size)}</span>
                  <span className="text-xs text-zinc-700">·</span>
                  <span className="text-xs text-zinc-600">{new Date(video.uploadedAt).toLocaleDateString('ja-JP')}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => copyUrl(video.url)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border font-medium transition-colors ${
                      copiedUrl === video.url
                        ? 'border-emerald-800 bg-emerald-950/40 text-emerald-400'
                        : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}>
                    {copiedUrl === video.url ? '✓ コピー済み' : 'URLをコピー'}
                  </button>
                  <button onClick={() => handleDelete(video)}
                    className="p-1.5 text-zinc-700 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setPreviewVideo(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <p className="font-medium text-zinc-200 truncate pr-4">{previewVideo.filename}</p>
              <button onClick={() => setPreviewVideo(null)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <video src={previewVideo.url} controls autoPlay className="w-full aspect-video bg-black" />
            <div className="p-4 flex items-center gap-3">
              <input readOnly value={previewVideo.url}
                className="flex-1 text-xs px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 font-mono"
                onClick={(e) => (e.target as HTMLInputElement).select()} />
              <button onClick={() => copyUrl(previewVideo.url)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  copiedUrl === previewVideo.url ? 'bg-emerald-600 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'
                }`}>
                {copiedUrl === previewVideo.url ? '✓ コピー済み' : 'URLをコピー'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
