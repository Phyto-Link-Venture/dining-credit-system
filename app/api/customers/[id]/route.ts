import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const showDeleted = req.nextUrl.searchParams.get('showDeleted') === '1';
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const filter = showDeleted ? '' : 'AND is_deleted = 0';
  const transactions = db.prepare(`SELECT * FROM transactions WHERE customer_id = ? ${filter} ORDER BY created_at DESC`).all(id);
  return NextResponse.json({ customer, transactions });
}
