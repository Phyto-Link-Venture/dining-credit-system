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
  
  // Check for existing phone (including soft-deleted)
  const existingPhone = db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone) as any;
  if (existingPhone) {
    if (existingPhone.is_deleted) {
      return NextResponse.json({ error: 'PHONE_DELETED', name: existingPhone.name }, { status: 409 });
    }
    return NextResponse.json({ error: 'PHONE_EXISTS', name: existingPhone.name }, { status: 409 });
  }
  
  // Check for existing name (including soft-deleted)
  const existingName = db.prepare('SELECT * FROM customers WHERE name = ? AND is_deleted = 0').get(name) as any;
  if (existingName) {
    return NextResponse.json({ error: 'NAME_EXISTS', phone: existingName.phone }, { status: 409 });
  }

  const result = db.prepare('INSERT INTO customers (name, phone) VALUES (?, ?)').run(name, phone);
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(customer, { status: 201 });
}
