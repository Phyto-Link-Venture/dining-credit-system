import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const { customer_id, amount, signature, description, attachment } = await req.json();
  if (!customer_id || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Valid customer_id and amount required' }, { status: 400 });
  }
  if (!signature) {
    return NextResponse.json({ error: 'Customer signature is required' }, { status: 400 });
  }

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id) as any;
  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  if (customer.balance < amount) {
    return NextResponse.json({ error: `Insufficient balance. Current: RM${customer.balance.toFixed(2)}` }, { status: 400 });
  }

  const balanceBefore = customer.balance;
  const balanceAfter = balanceBefore - amount;

  const txn = db.transaction(() => {
    db.prepare('UPDATE customers SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(balanceAfter, customer_id);
    db.prepare('INSERT INTO transactions (customer_id, type, amount, bonus, balance_before, balance_after, description, signature, attachment) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?)').run(customer_id, 'deduct', amount, balanceBefore, balanceAfter, description || `Deduct RM${amount.toFixed(2)}`, signature, attachment || null);
  });
  txn();

  return NextResponse.json({ balance_before: balanceBefore, balance_after: balanceAfter, amount });
}
