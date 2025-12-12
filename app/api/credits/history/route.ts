import { NextResponse } from 'next/server';
import { db } from '@/db';
import { creditTransactions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, session.id))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(50);

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching credit history:', error);
    return NextResponse.json({ error: 'Failed to fetch credit history' }, { status: 500 });
  }
}
