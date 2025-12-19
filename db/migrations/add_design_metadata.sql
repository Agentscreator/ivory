-- Add design_metadata column to looks table for storing all capture page settings
ALTER TABLE looks ADD COLUMN IF NOT EXISTS design_metadata JSONB;

-- Add comment explaining the field
COMMENT ON COLUMN looks.design_metadata IS 'Stores all capture page settings including design images, colors, finish, influence weights, etc. for remix/edit functionality';
