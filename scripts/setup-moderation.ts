/**
 * Setup script for content moderation features
 * Run with: npx tsx scripts/setup-moderation.ts
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

async function setupModeration() {
  console.log('🚀 Setting up content moderation features...\n');

  try {
    // Create content_flags table
    console.log('Creating content_flags table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS content_flags (
        id SERIAL PRIMARY KEY,
        reporter_id INTEGER NOT NULL REFERENCES users(id),
        content_type VARCHAR(50) NOT NULL,
        content_id INTEGER NOT NULL,
        content_owner_id INTEGER NOT NULL REFERENCES users(id),
        reason VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        reviewed_by INTEGER REFERENCES users(id),
        reviewed_at TIMESTAMP,
        action_taken TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ content_flags table created\n');

    // Create blocked_users table
    console.log('Creating blocked_users table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS blocked_users (
        id SERIAL PRIMARY KEY,
        blocker_id INTEGER NOT NULL REFERENCES users(id),
        blocked_id INTEGER NOT NULL REFERENCES users(id),
        reason VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(blocker_id, blocked_id)
      );
    `);
    console.log('✅ blocked_users table created\n');

    // Create indexes
    console.log('Creating indexes...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_content_flags_reporter ON content_flags(reporter_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_content_flags_content ON content_flags(content_type, content_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_content_flags_status ON content_flags(status);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);
    `);
    console.log('✅ Indexes created\n');

    console.log('🎉 Content moderation setup complete!\n');
    console.log('Next steps:');
    console.log('1. Test the flagging feature on any user content');
    console.log('2. Test the blocking feature on user profiles');
    console.log('3. Check Settings > Blocked Users to manage blocks');
    console.log('4. Review CONTENT_MODERATION_IMPLEMENTATION.md for details\n');

  } catch (error) {
    console.error('❌ Error setting up moderation:', error);
    throw error;
  }
}

setupModeration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
