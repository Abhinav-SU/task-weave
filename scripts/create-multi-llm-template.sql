-- Two-Step Multi-LLM Template: ChatGPT -> Gemini
-- Step 1: ChatGPT researches the topic
-- Step 2: Gemini analyzes and expands on ChatGPT's research

DELETE FROM tasks WHERE is_template = 'yes' AND title = 'Multi-LLM Research Pipeline';

INSERT INTO tasks (user_id, title, description, status, is_template, metadata)
SELECT 
  id,
  'Multi-LLM Research Pipeline',
  'Two-step workflow: ChatGPT researches a topic, then Gemini analyzes and expands the findings',
  'active',
  'yes',
  jsonb_build_object(
    'nodes', jsonb_build_array(
      -- Node 1: ChatGPT Research
      jsonb_build_object(
        'id', 'node_1',
        'type', 'aiNode',
        'data', jsonb_build_object(
          'label', 'ChatGPT Research',
          'platform', 'chatgpt',
          'model', 'gpt-4',
          'prompt', 'Research the following topic and provide a comprehensive overview with key facts and insights: {{topic}}

Provide:
1. Main concepts and definitions
2. Current state and recent developments
3. Key statistics or data points
4. Important considerations',
          'temperature', 0.7
        ),
        'position', jsonb_build_object('x', 100, 'y', 100)
      ),
      -- Node 2: Gemini Analysis
      jsonb_build_object(
        'id', 'node_2',
        'type', 'aiNode',
        'data', jsonb_build_object(
          'label', 'Gemini Deep Analysis',
          'platform', 'gemini',
          'model', 'gemini-2.5-flash',
          'prompt', 'Based on this research from ChatGPT, provide a deeper analysis and expansion:

{{node_1_output}}

Please:
1. Identify any gaps or areas that need more exploration
2. Add technical details and expert insights
3. Provide practical applications and use cases
4. Suggest future trends and predictions
5. Create a synthesis that combines both perspectives',
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
        'description', 'The topic you want both AI models to research and analyze'
      )
    )
  )
FROM users;

-- Verify the templates were created
SELECT 
  u.email,
  t.title,
  t.metadata->'nodes'->0->'data'->>'platform' as step1_platform,
  t.metadata->'nodes'->1->'data'->>'platform' as step2_platform,
  jsonb_array_length(t.metadata->'nodes') as node_count
FROM tasks t
JOIN users u ON t.user_id = u.id
WHERE t.is_template = 'yes' AND t.title = 'Multi-LLM Research Pipeline'
ORDER BY u.email;
