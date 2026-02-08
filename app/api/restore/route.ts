import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const { type, id } = await req.json();

  if (type === 'customer') {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ? AND is_deleted = 1').get(id) as any;
    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    // Restore customer
    db.prepare('UPDATE customers SET is_deleted = 0, deleted_at = NULL, deleted_signature = NULL, deleted_reason = NULL WHERE id = ?').run(id);
    // Restore their transactions too
    db.prepare('UPDATE transactions SET is_deleted = 0, deleted_at = NULL, deleted_signature = NULL, deleted_reason = NULL WHERE customer_id = ?').run(id);
    // Recalculate balance from all active transactions
    const txns = db.prepare('SELECT type, amount, bonus FROM transactions WHERE customer_id = ? AND is_deleted = 0 ORDER BY created_at ASC').all(id) as any[];
    let balance = 0;
    for (const t of txns) {
      if (t.type === 'topup') balance += t.amount + (t.bonus || 0);
      else balance -= t.amount;
    }
    db.prepare('UPDATE customers SET balance = ? WHERE id = ?').run(balance, id);
    return NextResponse.json({ success: true, balance });
  }

  if (type === 'transaction') {
    const txn = db.prepare('SELECT * FROM transactions WHERE id = ? AND is_deleted = 1').get(id) as any;
    if (!txn) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(txn.customer_id) as any;
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    // Restore transaction and reverse the balance effect
    const delta = txn.type === 'topup' ? txn.amount + (txn.bonus || 0) : -txn.amount;
    db.prepare('UPDATE customers SET balance = balance + ? WHERE id = ?').run(delta, txn.customer_id);
    db.prepare('UPDATE transactions SET is_deleted = 0, deleted_at = NULL, deleted_signature = NULL, deleted_reason = NULL WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
