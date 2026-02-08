import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';
  const showDeleted = req.nextUrl.searchParams.get('showDeleted') === '1';
  const filter = showDeleted ? '' : 'AND is_deleted = 0';
  const customers = search
    ? db.prepare(`SELECT * FROM customers WHERE (name LIKE ? OR phone LIKE ?) ${filter} ORDER BY is_deleted ASC, name`).all(`%${search}%`, `%${search}%`)
    : db.prepare(`SELECT * FROM customers WHERE 1=1 ${filter} ORDER BY is_deleted ASC, name`).all();
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const { name, phone } = await req.json();
  if (!name || !phone) return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
  try {
    const result = db.prepare('INSERT INTO customers (name, phone) VALUES (?, ?)').run(name, phone);
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(customer, { status: 201 });
  } catch (e: any) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
    throw e;
  }
}
