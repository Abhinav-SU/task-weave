-- Create Smart Research Assistant for all users
INSERT INTO tasks (user_id, title, description, status, metadata, is_template, tags, created_at, updated_at)
SELECT 
    id,
    'Smart Research Assistant',
    'AI-powered research assistant that helps you gather comprehensive information on any topic',
    'pending',
    '{"nodes":[{"id":"node_1","type":"llm","data":{"model":"gpt-4","prompt":"Research the following topic and provide comprehensive information: {{topic}}\n\nProvide:\n1. Overview and key concepts\n2. Current trends and developments\n3. Practical applications\n4. Future outlook","temperature":0.7},"position":{"x":100,"y":100}}],"edges":[],"isTemplate":true}'::jsonb,
    'yes',
    '[]'::jsonb,
    NOW(),
    NOW()
FROM users
WHERE id != 'f4989765-48cc-4eb8-92be-f5b3d54b4f23'
ON CONFLICT DO NOTHING;

-- Create Code Review Assistant for all users
INSERT INTO tasks (user_id, title, description, status, metadata, is_template, tags, created_at, updated_at)
SELECT 
    id,
    'Code Review Assistant',
    'AI-powered code review assistant that analyzes code quality, security, and best practices',
    'pending',
    '{"nodes":[{"id":"node_1","type":"llm","data":{"model":"gpt-4","prompt":"Review the following code and identify issues:\n\n```\n{{code}}\n```\n\nAnalyze for:\n1. Bugs and errors\n2. Performance issues\n3. Security vulnerabilities\n4. Best practices","temperature":0.3},"position":{"x":100,"y":100}}],"edges":[],"isTemplate":true}'::jsonb,
    'yes',
    '[]'::jsonb,
    NOW(),
    NOW()
FROM users
WHERE id != 'f4989765-48cc-4eb8-92be-f5b3d54b4f23'
ON CONFLICT DO NOTHING;
