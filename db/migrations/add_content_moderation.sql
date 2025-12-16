-- Add content moderation tables

-- Content flags table
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

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id SERIAL PRIMARY KEY,
  blocker_id INTEGER NOT NULL REFERENCES users(id),
  blocked_id INTEGER NOT NULL REFERENCES users(id),
  reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(blocker_id, blocked_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_flags_reporter ON content_flags(reporter_id);
CREATE INDEX IF NOT EXISTS idx_content_flags_content ON content_flags(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_flags_status ON content_flags(status);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);
