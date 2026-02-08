import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const filePath = path.join(process.cwd(), 'data', 'uploads', filename);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', pdf: 'application/pdf', webp: 'image/webp' };
  const contentType = mimeMap[ext || ''] || 'application/octet-stream';
  
  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, { headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000' } });
}
