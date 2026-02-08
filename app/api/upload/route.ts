import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (e: any) {
    console.error('Upload formData parse error:', e.message);
    return NextResponse.json({ error: 'Failed to parse upload: ' + e.message }, { status: 400 });
  }
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 413 });

  const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });

  const ext = file.name.split('.').pop() || 'bin';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({ path: `/api/uploads/${filename}` });
}
