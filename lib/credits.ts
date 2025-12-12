import { db } from '@/db';
import { users, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function deductCredits(
  userId: number,
  amount: number,
  type: string,
  description: string,
  relatedId?: number
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    // Get current balance
    const user = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId));

    if (user.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const currentBalance = user[0].credits;

    if (currentBalance < amount) {
      return { success: false, error: 'Insufficient credits' };
    }

    const newBalance = currentBalance - amount;

    // Update user's credits
    await db
      .update(users)
      .set({ credits: newBalance })
      .where(eq(users.id, userId));

    // Log the transaction
    await db.insert(creditTransactions).values({
      userId,
      amount: -amount,
      type,
      description,
      relatedId,
      balanceAfter: newBalance,
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Error deducting credits:', error);
    return { success: false, error: 'Failed to deduct credits' };
  }
}

export async function addCredits(
  userId: number,
  amount: number,
  type: string,
  description: string,
  relatedId?: number
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    // Get current balance
    const user = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId));

    if (user.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const currentBalance = user[0].credits;
    const newBalance = currentBalance + amount;

    // Update user's credits
    await db
      .update(users)
      .set({ credits: newBalance })
      .where(eq(users.id, userId));

    // Log the transaction
    await db.insert(creditTransactions).values({
      userId,
      amount,
      type,
      description,
      relatedId,
      balanceAfter: newBalance,
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Error adding credits:', error);
    return { success: false, error: 'Failed to add credits' };
  }
}

export async function getCreditsBalance(userId: number): Promise<number | null> {
  try {
    const user = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId));

    if (user.length === 0) {
      return null;
    }

    return user[0].credits;
  } catch (error) {
    console.error('Error getting credits balance:', error);
    return null;
  }
}
