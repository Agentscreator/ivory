-- Add generation_jobs table for background design generation
CREATE TABLE IF NOT EXISTS generation_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  prompt TEXT NOT NULL,
  original_image TEXT NOT NULL,
  selected_design_images TEXT, -- JSON array
  drawing_image_url TEXT,
  influence_weights TEXT, -- JSON object
  design_settings TEXT, -- JSON object
  result_images TEXT, -- JSON array of generated image URLs
  error_message TEXT,
  credits_deducted BOOLEAN DEFAULT FALSE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_id ON generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_created_at ON generation_jobs(created_at);
