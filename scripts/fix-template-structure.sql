-- Fix Smart Research Assistant template structure
UPDATE tasks 
SET metadata = '{
  "nodes": [
    {
      "id": "node_1",
      "type": "aiNode",
      "data": {
        "label": "Research Topic",
        "platform": "chatgpt",
        "model": "gpt-4",
        "prompt": "Research the following topic and provide comprehensive information: {{topic}}\n\nProvide:\n1. Overview and key concepts\n2. Current trends and developments\n3. Practical applications\n4. Future outlook",
        "temperature": 0.7
      },
      "position": {"x": 100, "y": 100}
    }
  ],
  "edges": [],
  "isTemplate": true
}'::jsonb
WHERE is_template = 'yes' AND title = 'Smart Research Assistant';

-- Fix Code Review Assistant template structure  
UPDATE tasks
SET metadata = '{
  "nodes": [
    {
      "id": "node_1",
      "type": "aiNode",
      "data": {
        "label": "Review Code",
        "platform": "chatgpt",
        "model": "gpt-4",
        "prompt": "Review the following code and identify issues:\n\n```\n{{code}}\n```\n\nAnalyze for:\n1. Bugs and errors\n2. Performance issues\n3. Security vulnerabilities\n4. Best practices",
        "temperature": 0.3
      },
      "position": {"x": 100, "y": 100}
    }
  ],
  "edges": [],
  "isTemplate": true
}'::jsonb
WHERE is_template = 'yes' AND title = 'Code Review Assistant';
