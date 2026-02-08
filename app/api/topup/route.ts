import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const { customer_id, amount, promotion_id, attachment } = await req.json();
  if (!customer_id || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Valid customer_id and amount required' }, { status: 400 });
  }

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id) as any;
  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

  let bonus = 0;
  let description = `Top up RM${amount.toFixed(2)}`;

  if (promotion_id) {
    const promo = db.prepare('SELECT * FROM promotions WHERE id = ? AND is_active = 1').get(promotion_id) as any;
    if (promo && amount >= promo.topup_amount) {
      bonus = promo.bonus_amount;
      description += ` (Promo: ${promo.name} - Free RM${bonus.toFixed(2)})`;
    }
  }

  const balanceBefore = customer.balance;
  const balanceAfter = balanceBefore + amount + bonus;

  const txn = db.transaction(() => {
    db.prepare('UPDATE customers SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(balanceAfter, customer_id);
    db.prepare('INSERT INTO transactions (customer_id, type, amount, bonus, balance_before, balance_after, description, attachment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(customer_id, 'topup', amount, bonus, balanceBefore, balanceAfter, description, attachment || null);
  });
  txn();

  return NextResponse.json({ balance_before: balanceBefore, balance_after: balanceAfter, bonus, amount });
}
