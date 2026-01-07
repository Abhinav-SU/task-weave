-- Two-Step ChatGPT-Only Template: Research -> Analyze
-- Step 1: GPT-4 researches the topic
-- Step 2: GPT-4 analyzes and critiques the research

DELETE FROM tasks WHERE is_template = 'yes' AND title = 'ChatGPT Research & Analysis';

INSERT INTO tasks (user_id, title, description, status, is_template, metadata)
SELECT 
  id,
  'ChatGPT Research & Analysis',
  'Two-step ChatGPT workflow: First research a topic, then analyze and critique the findings',
  'active',
  'yes',
  jsonb_build_object(
    'nodes', jsonb_build_array(
      -- Node 1: Research
      jsonb_build_object(
        'id', 'node_1',
        'type', 'aiNode',
        'data', jsonb_build_object(
          'label', 'GPT-4 Research',
          'platform', 'chatgpt',
          'model', 'gpt-4',
          'prompt', 'Research the following topic and provide comprehensive information: {{topic}}

Provide:
1. Overview and background
2. Key facts and statistics
3. Main concepts and theories
4. Current developments
5. Important considerations',
          'temperature', 0.7
        ),
        'position', jsonb_build_object('x', 100, 'y', 100)
      ),
      -- Node 2: Critical Analysis
      jsonb_build_object(
        'id', 'node_2',
        'type', 'aiNode',
        'data', jsonb_build_object(
          'label', 'GPT-4 Critical Analysis',
          'platform', 'chatgpt',
          'model', 'gpt-4',
          'prompt', 'Based on the research below, provide a critical analysis and deeper insights:

RESEARCH:
{{node_1_output}}

Please provide:
1. Critical evaluation of the information presented
2. Potential biases or gaps in the research
3. Alternative perspectives or counterarguments
4. Practical implications and applications
5. Future directions and unanswered questions
6. A synthesis that combines both the research and your analysis',
          'temperature', 0.8
        ),
        'position', jsonb_build_object('x', 100, 'y', 300)
      ),
      -- End Node
      jsonb_build_object(
        'id', 'node_3',
        'type', 'endNode',
        'data', jsonb_build_object(
          'label', 'Complete',
          'output', '{{node_2_output}}'
        ),
        'position', jsonb_build_object('x', 100, 'y', 500)
      )
    ),
    'edges', jsonb_build_array(
      jsonb_build_object(
        'id', 'edge_1',
        'source', 'node_1',
        'target', 'node_2',
        'type', 'default'
      ),
      jsonb_build_object(
        'id', 'edge_2',
        'source', 'node_2',
        'target', 'node_3',
        'type', 'default'
      )
    ),
    'variables', jsonb_build_object(
      'topic', jsonb_build_object(
        'type', 'string',
        'label', 'Research Topic',
        'required', true,
        'description', 'The topic you want to research and analyze'
      )
    )
  )
FROM users;

-- Verify
SELECT 
  u.email,
  t.title,
  jsonb_array_length(t.metadata->'nodes') as node_count
FROM tasks t
JOIN users u ON t.user_id = u.id
WHERE t.is_template = 'yes' AND t.title = 'ChatGPT Research & Analysis'
ORDER BY u.email;
