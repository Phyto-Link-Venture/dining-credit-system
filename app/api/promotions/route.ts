import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const promos = db.prepare('SELECT * FROM promotions WHERE is_active = 1 ORDER BY topup_amount').all();
  return NextResponse.json(promos);
}

export async function POST(req: NextRequest) {
  const { name, topup_amount, bonus_amount } = await req.json();
  if (!name || !topup_amount || !bonus_amount) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }
  const result = db.prepare('INSERT INTO promotions (name, topup_amount, bonus_amount) VALUES (?, ?, ?)').run(name, topup_amount, bonus_amount);
  const promo = db.prepare('SELECT * FROM promotions WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(promo, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  db.prepare('UPDATE promotions SET is_active = 0 WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
