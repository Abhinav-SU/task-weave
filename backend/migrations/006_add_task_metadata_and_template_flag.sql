ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS metadata JSONB,
  ADD COLUMN IF NOT EXISTS is_template TEXT;

ALTER TABLE tasks
  ALTER COLUMN status SET DEFAULT 'active';

UPDATE tasks
SET is_template = COALESCE(is_template, 'no')
WHERE is_template IS NULL;
