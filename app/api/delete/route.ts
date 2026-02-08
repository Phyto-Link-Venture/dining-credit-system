import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const { type, id, signature, reason } = await req.json();
  if (!id || !signature) return NextResponse.json({ error: 'ID and signature required' }, { status: 400 });

  if (type === 'customer') {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ? AND is_deleted = 0').get(id) as any;
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const txn = db.transaction(() => {
      db.prepare('UPDATE customers SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_signature = ?, deleted_reason = ? WHERE id = ?').run(signature, reason || 'Removed by boss', id);
      // Soft delete all their transactions too
      db.prepare('UPDATE transactions SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_signature = ?, deleted_reason = ? WHERE customer_id = ? AND is_deleted = 0').run(signature, 'Customer removed', id);
    });
    txn();
    return NextResponse.json({ ok: true });
  }

  if (type === 'transaction') {
    const t = db.prepare('SELECT * FROM transactions WHERE id = ? AND is_deleted = 0').get(id) as any;
    if (!t) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(t.customer_id) as any;

    // Reverse the transaction effect on balance
    const txn = db.transaction(() => {
      let newBalance = customer.balance;
      if (t.type === 'topup') {
        newBalance -= (t.amount + t.bonus); // Reverse topup
      } else {
        newBalance += t.amount; // Reverse deduct
      }
      db.prepare('UPDATE customers SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newBalance, customer.id);
      db.prepare('UPDATE transactions SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_signature = ?, deleted_reason = ? WHERE id = ?').run(signature, reason || 'Removed by boss', id);
    });
    txn();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
