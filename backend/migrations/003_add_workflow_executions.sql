-- Migration: Add workflow_executions table
-- Created: 2025-11-19

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  current_node TEXT,
  variables JSONB NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_executions_task_id ON workflow_executions(task_id);
CREATE INDEX IF NOT EXISTS idx_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_template_id ON workflow_executions(template_id);

-- Add comment
COMMENT ON TABLE workflow_executions IS 'Stores workflow template execution records and their results';

