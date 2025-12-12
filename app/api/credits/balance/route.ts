import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, session.id));

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ credits: user[0].credits });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return NextResponse.json({ error: 'Failed to fetch credit balance' }, { status: 500 });
  }
}
