/**
 * Migration script to add referral codes to existing users
 * Run with: npx tsx scripts/add-referral-codes.ts
 */

import { db } from '../db';
import { users } from '../db/schema';
import { isNull, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

async function addReferralCodes() {
  console.log('🔍 Finding users without referral codes...');

  // Get all users without referral codes
  const usersWithoutCodes = await db
    .select()
    .from(users)
    .where(isNull(users.referralCode));

  console.log(`📊 Found ${usersWithoutCodes.length} users without referral codes`);

  if (usersWithoutCodes.length === 0) {
    console.log('✅ All users already have referral codes!');
    return;
  }

  // Update each user with a unique referral code
  for (const user of usersWithoutCodes) {
    const referralCode = nanoid(10);
    
    await db
      .update(users)
      .set({ referralCode })
      .where(eq(users.id, user.id));

    console.log(`✅ Added referral code for user ${user.username}: ${referralCode}`);
  }

  console.log(`🎉 Successfully added referral codes to ${usersWithoutCodes.length} users!`);
}

addReferralCodes()
  .then(() => {
    console.log('✅ Migration complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
