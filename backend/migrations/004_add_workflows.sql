-- Migration: Add Workflow Tables for Multi-LLM Orchestration
-- Date: 2024-12-21

-- ============================================
-- WORKFLOWS TABLE (DAG definitions)
-- ============================================
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- DAG structure (JSON)
    nodes JSONB NOT NULL DEFAULT '[]',
    edges JSONB NOT NULL DEFAULT '[]',
    
    -- Input variables schema
    variables JSONB NOT NULL DEFAULT '[]',
    
    -- Metadata
    category TEXT,
    icon TEXT,
    color TEXT,
    
    -- Visibility
    is_template BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Stats
    run_count INTEGER DEFAULT 0,
    avg_duration_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for faster user lookup
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflows_is_template ON workflows(is_template) WHERE is_template = TRUE;
CREATE INDEX IF NOT EXISTS idx_workflows_is_public ON workflows(is_public) WHERE is_public = TRUE;

-- ============================================
-- WORKFLOW RUNS TABLE (Execution instances)
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status: pending, running, completed, failed, cancelled
    status TEXT NOT NULL DEFAULT 'pending',
    
    -- Input/Output
    input_variables JSONB NOT NULL DEFAULT '{}',
    final_output JSONB,
    
    -- Execution tracking
    current_node_id TEXT,
    completed_nodes JSONB NOT NULL DEFAULT '[]',
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Cost tracking
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0,
    
    -- Error handling
    error TEXT,
    error_node_id TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_user_id ON workflow_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_created_at ON workflow_runs(created_at DESC);

-- ============================================
-- NODE EXECUTIONS TABLE (Individual node results)
-- ============================================
CREATE TABLE IF NOT EXISTS node_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
    
    -- Node identification
    node_id TEXT NOT NULL,
    node_type TEXT NOT NULL,
    
    -- Status: pending, running, completed, failed, skipped
    status TEXT NOT NULL DEFAULT 'pending',
    
    -- Input/Output
    input JSONB,
    output JSONB,
    
    -- LLM-specific data
    provider TEXT,
    model TEXT,
    prompt TEXT,
    response TEXT,
    
    -- Token tracking
    tokens_input INTEGER,
    tokens_output INTEGER,
    cost DECIMAL(10, 6),
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    
    -- Error
    error TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_node_executions_run_id ON node_executions(run_id);
CREATE INDEX IF NOT EXISTS idx_node_executions_node_id ON node_executions(node_id);
CREATE INDEX IF NOT EXISTS idx_node_executions_status ON node_executions(status);

-- ============================================
-- LLM CONFIGS TABLE (User API keys)
-- ============================================
CREATE TABLE IF NOT EXISTS llm_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    provider TEXT NOT NULL,
    api_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Optional settings
    default_model TEXT,
    max_tokens INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Unique constraint: one config per provider per user
    UNIQUE(user_id, provider)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_llm_configs_user_id ON llm_configs(user_id);

-- ============================================
-- UPDATE TRIGGER for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflow_runs_updated_at ON workflow_runs;
CREATE TRIGGER update_workflow_runs_updated_at
    BEFORE UPDATE ON workflow_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_llm_configs_updated_at ON llm_configs;
CREATE TRIGGER update_llm_configs_updated_at
    BEFORE UPDATE ON llm_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DEFAULT TEMPLATES
-- ============================================
-- Note: These will be inserted with a system user or admin user
-- For now, we'll create them when the first admin signs up


