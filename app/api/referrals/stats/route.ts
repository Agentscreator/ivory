import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, referrals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's referral code
    const user = await db
      .select({ referralCode: users.referralCode })
      .from(users)
      .where(eq(users.id, session.id));

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get referral stats
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, session.id));

    const totalReferrals = userReferrals.length;
    const awardedReferrals = userReferrals.filter(r => r.creditAwarded).length;
    const pendingReferrals = totalReferrals - awardedReferrals;
    const creditsEarned = Math.floor(awardedReferrals / 3);
    const referralsUntilNextCredit = pendingReferrals >= 3 ? 0 : 3 - pendingReferrals;

    return NextResponse.json({
      referralCode: user[0].referralCode,
      totalReferrals,
      creditsEarned,
      pendingReferrals,
      referralsUntilNextCredit,
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json({ error: 'Failed to fetch referral stats' }, { status: 500 });
  }
}
