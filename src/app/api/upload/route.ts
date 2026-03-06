import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  // Session check only for token generation (completion callback comes from Vercel servers without cookies)
  let session = null;
  if (body.type === 'blob.generate-client-token') {
    session = await getSession();
    if (!session) return NextResponse.json({ error: '未ログイン' }, { status: 401 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = clientPayload ? JSON.parse(clientPayload) : {};
        const type = payload.type || 'submission';

        if (type === 'lesson') {
          if (session?.role !== 'admin') throw new Error('権限がありません');
          if (!pathname.startsWith('lesson-videos/')) throw new Error('不正なパスです');
        } else {
          if (!pathname.startsWith('videos/')) throw new Error('不正なパスです');
        }

        return {
          allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi', 'video/x-msvideo', 'video/*'],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB
          addRandomSuffix: false,
          allowOverwrite: true,
          tokenPayload: JSON.stringify({ userId: session?.id, type }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url);
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
