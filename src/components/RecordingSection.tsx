'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { Camera, CameraOff, Circle, Square, Upload, CheckCircle, Loader2 } from 'lucide-react';

interface RecordingSectionProps {
  lessonId: string;
  courseId: string;
  onUploaded: (url: string) => void;
}

type RecordingState = 'idle' | 'ready' | 'recording' | 'preview' | 'uploading' | 'done';

export default function RecordingSection({ lessonId, courseId, onUploaded }: RecordingSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>('video/webm');

  const [state, setState] = useState<RecordingState>('idle');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setState('ready');
    } catch {
      setError('カメラへのアクセスが許可されていません。ブラウザの設定を確認してください。');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    // Pick a supported mimeType (WebM for Chrome/Firefox, MP4 for Safari)
    const preferred = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
      '',
    ];
    const mimeType = preferred.find((m) => m === '' || MediaRecorder.isTypeSupported(m)) ?? '';
    mimeTypeRef.current = mimeType || 'video/webm';

    const options = mimeType ? { mimeType } : {};
    const mr = new MediaRecorder(streamRef.current, options);
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
      setRecordedBlob(blob);
      if (previewRef.current) previewRef.current.src = URL.createObjectURL(blob);
      stopCamera();
      setState('preview');
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setState('recording');
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();

  const handleUpload = async () => {
    if (!recordedBlob) return;
    setState('uploading');
    setUploadProgress(0);
    try {
      const ext = mimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm';
      const pathname = `videos/recording_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;
      const { url } = await upload(pathname, recordedBlob, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        multipart: true,
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      });
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, courseId, videoUrl: url }),
      });
      setUploadProgress(100);
      onUploaded(url);
      setState('done');
    } catch {
      setError('アップロードに失敗しました');
      setState('preview');
    }
  };

  const reset = () => {
    setRecordedBlob(null);
    setUploadProgress(0);
    setState('idle');
  };

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5 text-violet-400" />
        アウトプット録画
      </h3>

      {error && (
        <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-900/50 text-rose-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>
      )}

      {state === 'done' ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <CheckCircle className="w-16 h-16 text-emerald-400" />
          <p className="text-lg font-medium text-zinc-200">アップロード完了！</p>
          <button onClick={reset} className="mt-2 px-4 py-2 text-sm text-violet-400 border border-violet-800 rounded-xl hover:bg-violet-900/20 transition-colors">再度録画する</button>
        </div>
      ) : state === 'preview' ? (
        <div className="space-y-4">
          <video ref={previewRef} controls className="w-full rounded-xl bg-black aspect-video" />
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 px-4 py-2.5 border border-zinc-700 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-800 transition-colors">撮り直す</button>
            <button onClick={handleUpload} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors">
              <Upload className="w-4 h-4" />提出する
            </button>
          </div>
        </div>
      ) : state === 'uploading' ? (
        <div className="py-8 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            <span className="text-zinc-300">アップロード中... {uploadProgress}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div className="bg-violet-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {(state === 'ready' || state === 'recording') && (
            <video ref={videoRef} muted className="w-full rounded-xl bg-black aspect-video" />
          )}
          <div className="flex gap-3">
            {state === 'idle' && (
              <button onClick={startCamera} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors">
                <Camera className="w-4 h-4" />カメラを起動
              </button>
            )}
            {state === 'ready' && (
              <>
                <button onClick={startRecording} className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors">
                  <Circle className="w-4 h-4 fill-white" />録画開始
                </button>
                <button onClick={() => { stopCamera(); setState('idle'); }} className="flex items-center gap-2 px-4 py-2.5 border border-zinc-700 text-zinc-400 rounded-xl text-sm hover:bg-zinc-800 transition-colors">
                  <CameraOff className="w-4 h-4" />キャンセル
                </button>
              </>
            )}
            {state === 'recording' && (
              <button onClick={stopRecording} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-700 text-white rounded-xl text-sm font-medium animate-pulse">
                <Square className="w-4 h-4 fill-white" />録画停止
              </button>
            )}
          </div>
          {state === 'idle' && (
            <p className="text-sm text-zinc-500">学習した内容をカメラで録画して提出してください。</p>
          )}
        </div>
      )}
    </div>
  );
}
