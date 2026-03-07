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
    <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileVideo className="w-6 h-6 text-indigo-500" />動画ライブラリ
          </h1>
          <p className="text-gray-500 text-sm mt-1">{videos.length}件の動画</p>
        </div>
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm">
          <Upload className="w-4 h-4" />動画をアップロード
        </button>
        <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>

      <div
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 mb-8 text-center transition-all cursor-pointer ${
          uploading ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50'
        }`}
      >
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-sm text-gray-700 font-medium">「{uploadedName}」をアップロード中... {uploadProgress}%</p>
            {uploadProgress === 100 && <p className="text-xs text-emerald-600 flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" />完了！</p>}
            <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-1.5">
              <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">クリックまたはドラッグ＆ドロップで動画をアップロード</p>
            <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI, WebM 対応（最大500MB）</p>
          </>
        )}
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{uploadError}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white border border-gray-200 rounded-xl h-64 animate-pulse" />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p>動画がまだアップロードされていません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video.url} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all">
              <div className="relative bg-gray-900 aspect-video cursor-pointer group" onClick={() => setPreviewVideo(video)}>
                <video src={video.url} className="w-full h-full object-contain" preload="metadata" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="font-medium text-gray-800 text-sm truncate">{video.filename}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{formatBytes(video.size)}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{new Date(video.uploadedAt).toLocaleDateString('ja-JP')}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => copyUrl(video.url)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border font-medium transition-colors ${
                      copiedUrl === video.url
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}>
                    {copiedUrl === video.url ? '✓ コピー済み' : 'URLをコピー'}
                  </button>
                  <button onClick={() => handleDelete(video)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreviewVideo(null)}>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="font-medium text-gray-800 truncate pr-4">{previewVideo.filename}</p>
              <button onClick={() => setPreviewVideo(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <video src={previewVideo.url} controls autoPlay className="w-full aspect-video bg-black" />
            <div className="p-4 flex items-center gap-3">
              <input readOnly value={previewVideo.url}
                className="flex-1 text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-mono"
                onClick={(e) => (e.target as HTMLInputElement).select()} />
              <button onClick={() => copyUrl(previewVideo.url)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  copiedUrl === previewVideo.url ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
