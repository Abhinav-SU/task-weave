-- Migration: Make template_id nullable for inline templates
-- This allows workflow executions with client-side/inline templates that don't exist in database

-- First drop the existing foreign key constraint
ALTER TABLE workflow_executions 
  DROP CONSTRAINT IF EXISTS workflow_executions_template_id_tasks_id_fk;

-- Make template_id nullable
ALTER TABLE workflow_executions 
  ALTER COLUMN template_id DROP NOT NULL;

-- Re-add the foreign key constraint with SET NULL on delete (for nullable column)
ALTER TABLE workflow_executions 
  ADD CONSTRAINT workflow_executions_template_id_tasks_id_fk 
  FOREIGN KEY (template_id) REFERENCES tasks(id) ON DELETE SET NULL;

-- Done!

