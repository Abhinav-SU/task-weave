import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node, Edge } from '@xyflow/react';
import { api } from '@/lib/api';

export type NodeType = 'ai-platform' | 'condition' | 'transform' | 'merge';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: string;
  isPublic: boolean;
  estimatedTime: number;
  // Cost optimization fields
  estimatedCost: string; // e.g., "$0.02 - $0.05"
  costStrategy: string; // Why this multi-LLM approach saves money
  llmBreakdown: { model: string; role: string; costTier: 'low' | 'medium' | 'high' }[];
  author?: string;
  ratings?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowTemplate extends TemplateMetadata {
  nodes: Node[];
  edges: Edge[];
  inputVariables?: { name: string; description: string; required: boolean }[];
}

interface TemplateStore {
  templates: WorkflowTemplate[];
  currentTemplate: WorkflowTemplate | null;
  isLoading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  setCurrentTemplate: (template: WorkflowTemplate | null) => void;
  updateCurrentTemplate: (updates: Partial<WorkflowTemplate>) => void;
  saveTemplate: (template: WorkflowTemplate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplateById: (id: string) => WorkflowTemplate | undefined;
  duplicateTemplate: (id: string) => Promise<void>;
}

// ============================================
// COST-OPTIMIZED MULTI-LLM TEMPLATES
// ============================================
// 
// PRICING REFERENCE (per 1M tokens, as of 2025):
// - Gemini 2.5 Flash: ~$0.075 input, ~$0.30 output (CHEAP - use for bulk work)
// - GPT-4o: ~$2.50 input, ~$10 output (MEDIUM - use for structured/validation)
// - GPT-4o-mini: ~$0.15 input, ~$0.60 output (CHEAP - alternative to Gemini)
// - Claude 3.5 Sonnet: ~$3 input, ~$15 output (EXPENSIVE - use sparingly)
//
// STRATEGY: Use efficient models for bulk work, specialized models for precision tasks
// ============================================

const costOptimizedTemplates: WorkflowTemplate[] = [
  // ==========================================
  // RESEARCH & ANALYSIS (High-Value Multi-LLM)
  // ==========================================
  {
    id: 'template-deep-research',
    name: 'Deep Research Report',
    description: 'Multi-stage research: Gemini gathers & synthesizes, GPT-4 validates & structures. Optimized for both quality and efficiency.',
    category: 'Research',
    tags: ['research', 'analysis', 'report', 'cost-optimized'],
    icon: '🔬',
    isPublic: true,
    estimatedTime: 8,
    estimatedCost: '$0.03 - $0.08',
    costStrategy: 'Gemini handles 80% of token volume (research synthesis). GPT-4 only validates & structures final output.',
    llmBreakdown: [
      { model: 'Gemini 2.5 Flash', role: 'Research & Initial Synthesis', costTier: 'low' },
      { model: 'GPT-4o', role: 'Fact Validation & JSON Structure', costTier: 'medium' },
      { model: 'Gemini 2.5 Flash', role: 'Final Report Generation', costTier: 'low' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    inputVariables: [
      { name: 'topic', description: 'The topic to research', required: true },
      { name: 'depth', description: 'Research depth: brief, standard, comprehensive', required: false },
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'aiNode',
        position: { x: 100, y: 100 },
        data: {
          label: '1. Gemini: Research & Gather',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `You are a research assistant. Thoroughly research and analyze: "{{topic}}"

Provide comprehensive coverage of:
1. Core concepts and definitions
2. Current state and recent developments (2024-2025)
3. Key players, companies, or figures
4. Statistics and data points (with sources if known)
5. Pros and cons / advantages and challenges
6. Future outlook and trends

Be thorough but factual. Cite sources where possible. This is the foundation for a research report.`
        }
      },
      {
        id: 'node_2',
        type: 'aiNode',
        position: { x: 100, y: 300 },
        data: {
          label: '2. GPT-4: Validate & Structure',
          platform: 'chatgpt',
          model: 'gpt-4o',
          prompt: `Review this research for accuracy and structure it as JSON.

Research to validate:
{{node_1}}

Tasks:
1. Flag any claims that seem outdated, inaccurate, or need verification
2. Identify gaps in the research
3. Structure into clean sections

Respond with ONLY valid JSON:
{
  "validated_sections": [
    {"title": "...", "content": "...", "confidence": "high|medium|low"}
  ],
  "flagged_claims": ["..."],
  "missing_topics": ["..."],
  "quality_score": 1-10
}`
        }
      },
      {
        id: 'node_3',
        type: 'aiNode',
        position: { x: 100, y: 500 },
        data: {
          label: '3. Gemini: Generate Final Report',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Generate a polished research report based on validated research.

Validated Research Structure:
{{node_2}}

Original Research:
{{node_1}}

Create a professional report with:
- Executive Summary
- Key Findings
- Detailed Analysis
- Conclusions & Recommendations

Use markdown formatting. Be concise but comprehensive.`
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2' },
      { id: 'e2-3', source: 'node_2', target: 'node_3' },
    ],
  },

  // ==========================================
  // CODE REVIEW (Smart Cost Distribution)
  // ==========================================
  {
    id: 'template-smart-code-review',
    name: 'Smart Code Review',
    description: 'Gemini handles initial scan, GPT-4 does deep security & logic analysis. Each model used where it excels.',
    category: 'Development',
    tags: ['code', 'review', 'security', 'best-practices'],
    icon: '🔍',
    isPublic: true,
    estimatedTime: 5,
    estimatedCost: '$0.02 - $0.05',
    costStrategy: 'Gemini handles syntax/style checks. GPT-4 focuses on security & complex logic - its strength.',
    llmBreakdown: [
      { model: 'Gemini 2.5 Flash', role: 'Style, syntax, obvious issues', costTier: 'low' },
      { model: 'GPT-4o', role: 'Security vulnerabilities & logic bugs', costTier: 'medium' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    inputVariables: [
      { name: 'code', description: 'The code to review', required: true },
      { name: 'language', description: 'Programming language', required: false },
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'aiNode',
        position: { x: 100, y: 100 },
        data: {
          label: '1. Gemini: Quick Scan',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Quickly analyze this code for obvious issues:

\`\`\`{{language}}
{{code}}
\`\`\`

Check for:
1. Syntax errors or typos
2. Code style violations
3. Missing error handling
4. Unused variables or imports
5. Basic performance issues (N+1, etc.)
6. Documentation gaps

List issues found with line numbers. Be concise.`
        }
      },
      {
        id: 'node_2',
        type: 'aiNode',
        position: { x: 100, y: 300 },
        data: {
          label: '2. GPT-4: Deep Security & Logic',
          platform: 'chatgpt',
          model: 'gpt-4o',
          prompt: `You are a senior security engineer. Deep-dive into this code for critical issues.

Code:
\`\`\`{{language}}
{{code}}
\`\`\`

Previous scan found:
{{node_1}}

Focus on what the scan might have missed:
1. SECURITY: SQL injection, XSS, CSRF, auth bypasses, secrets exposure
2. LOGIC BUGS: Race conditions, edge cases, off-by-one, null handling
3. ARCHITECTURE: Coupling issues, SOLID violations, scalability concerns

For each issue provide:
- Severity: CRITICAL / HIGH / MEDIUM / LOW
- Location: line number or function
- Description
- Fix recommendation

Respond as JSON array of issues.`
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2' },
    ],
  },

  // ==========================================
  // CONTENT CREATION (Bulk Cheap + Polish)
  // ==========================================
  {
    id: 'template-blog-generator',
    name: 'Blog Post Pipeline',
    description: 'Gemini writes the draft, GPT-4 optimizes for SEO & engagement. Efficient multi-model workflow.',
    category: 'Writing',
    tags: ['blog', 'content', 'seo', 'writing'],
    icon: '✍️',
    isPublic: true,
    estimatedTime: 6,
    estimatedCost: '$0.02 - $0.04',
    costStrategy: 'Draft generation is 80% of tokens - handled by Gemini. GPT-4 does targeted precision edits.',
    llmBreakdown: [
      { model: 'Gemini 2.5 Flash', role: 'Outline & Draft Generation', costTier: 'low' },
      { model: 'GPT-4o', role: 'SEO optimization & Engagement hooks', costTier: 'medium' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    inputVariables: [
      { name: 'topic', description: 'Blog post topic', required: true },
      { name: 'targetAudience', description: 'Who is this for?', required: false },
      { name: 'tone', description: 'Tone: professional, casual, technical', required: false },
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'aiNode',
        position: { x: 100, y: 100 },
        data: {
          label: '1. Gemini: Draft Full Post',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Write a comprehensive blog post about: "{{topic}}"

Target audience: {{targetAudience}}
Tone: {{tone}}

Structure:
1. Attention-grabbing headline
2. Hook opening (first 2 sentences must captivate)
3. Introduction with clear value proposition
4. 3-5 main sections with subheadings
5. Practical examples or case studies
6. Conclusion with call-to-action

Word count: 1200-1500 words
Use markdown formatting.`
        }
      },
      {
        id: 'node_2',
        type: 'aiNode',
        position: { x: 100, y: 300 },
        data: {
          label: '2. GPT-4: SEO & Engagement Polish',
          platform: 'chatgpt',
          model: 'gpt-4o',
          prompt: `Optimize this blog post for SEO and engagement. Make ONLY necessary edits.

Draft:
{{node_1}}

Tasks (be surgical, don't rewrite everything):
1. Suggest 3 SEO-optimized title variations
2. Write meta description (155 chars max)
3. Add 5 relevant keywords that should be included
4. Improve the hook (first 2 sentences) for better engagement
5. Suggest 3 internal linking opportunities
6. Rate the post: engagement (1-10), SEO readiness (1-10)

Return as structured output, preserving the original draft where it's already good.`
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2' },
    ],
  },

  // ==========================================
  // DATA EXTRACTION (GPT-4 Strength)
  // ==========================================
  {
    id: 'template-data-extractor',
    name: 'Structured Data Extractor',
    description: 'Extract structured JSON from messy text. GPT-4 excels at this - worth the cost. Gemini preprocesses to reduce tokens.',
    category: 'Data',
    tags: ['extraction', 'json', 'parsing', 'data'],
    icon: '📊',
    isPublic: true,
    estimatedTime: 3,
    estimatedCost: '$0.01 - $0.03',
    costStrategy: 'Gemini cleans/summarizes input first (reduces tokens). GPT-4 extracts structure (its specialty).',
    llmBreakdown: [
      { model: 'Gemini 2.5 Flash', role: 'Clean & summarize input text', costTier: 'low' },
      { model: 'GPT-4o', role: 'Extract structured JSON', costTier: 'medium' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    inputVariables: [
      { name: 'text', description: 'Raw text to extract data from', required: true },
      { name: 'schema', description: 'What data to extract (e.g., names, dates, amounts)', required: true },
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'aiNode',
        position: { x: 100, y: 100 },
        data: {
          label: '1. Gemini: Clean & Summarize',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Clean and summarize this text, keeping only information relevant to extracting: {{schema}}

Raw text:
{{text}}

Remove:
- Boilerplate, headers, footers
- Irrelevant paragraphs
- Duplicate information

Keep:
- All data points matching the schema
- Context needed to understand the data
- Numbers, dates, names, amounts

Output the cleaned, condensed text.`
        }
      },
      {
        id: 'node_2',
        type: 'aiNode',
        position: { x: 100, y: 300 },
        data: {
          label: '2. GPT-4: Extract to JSON',
          platform: 'chatgpt',
          model: 'gpt-4o',
          prompt: `Extract structured data from this text into JSON.

Schema to extract: {{schema}}

Cleaned text:
{{node_1}}

Requirements:
1. Output ONLY valid JSON
2. Use consistent field names (camelCase)
3. Use appropriate types (numbers as numbers, dates as ISO strings)
4. Include confidence score for uncertain extractions
5. Return null for missing fields, don't guess

Example format:
{
  "extractedData": [...],
  "confidence": 0.95,
  "missingFields": ["..."],
  "ambiguousData": [{"field": "...", "options": [...]}]
}`
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2' },
    ],
  },

  // ==========================================
  // COMPARISON & DECISION (Multi-Perspective)
  // ==========================================
  {
    id: 'template-decision-analysis',
    name: 'Decision Analysis (Multi-Perspective)',
    description: 'Get different perspectives from different LLMs, then synthesize. Reduces single-model bias.',
    category: 'Analysis',
    tags: ['decision', 'comparison', 'analysis', 'strategy'],
    icon: '⚖️',
    isPublic: true,
    estimatedTime: 5,
    estimatedCost: '$0.03 - $0.06',
    costStrategy: 'Parallel Gemini analyses from different angles, GPT-4 synthesizes the balanced recommendation.',
    llmBreakdown: [
      { model: 'Gemini 2.5 Flash', role: 'Optimistic/Opportunity analysis', costTier: 'low' },
      { model: 'Gemini 2.5 Flash', role: 'Pessimistic/Risk analysis', costTier: 'low' },
      { model: 'GPT-4o', role: 'Synthesize & recommend', costTier: 'medium' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    inputVariables: [
      { name: 'decision', description: 'The decision to analyze', required: true },
      { name: 'context', description: 'Relevant context or constraints', required: false },
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'aiNode',
        position: { x: 50, y: 100 },
        data: {
          label: '1a. Gemini: Opportunity Lens',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Analyze this decision from an OPTIMISTIC perspective:

Decision: {{decision}}
Context: {{context}}

Focus on:
1. Potential benefits and opportunities
2. Best-case scenarios
3. Competitive advantages
4. Growth potential
5. What could go RIGHT

Be thorough but realistic. No blind optimism.`
        }
      },
      {
        id: 'node_2',
        type: 'aiNode',
        position: { x: 350, y: 100 },
        data: {
          label: '1b. Gemini: Risk Lens',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Analyze this decision from a CRITICAL/RISK perspective:

Decision: {{decision}}
Context: {{context}}

Focus on:
1. Potential risks and downsides
2. Worst-case scenarios
3. Hidden costs or complications
4. What could go WRONG
5. Red flags to watch for

Be thorough. Play devil's advocate.`
        }
      },
      {
        id: 'node_3',
        type: 'aiNode',
        position: { x: 200, y: 300 },
        data: {
          label: '2. GPT-4: Synthesize & Recommend',
          platform: 'chatgpt',
          model: 'gpt-4o',
          prompt: `Synthesize these two analyses into a balanced recommendation.

OPPORTUNITY ANALYSIS:
{{node_1}}

RISK ANALYSIS:
{{node_2}}

Original Decision: {{decision}}

Provide:
1. Summary of key opportunities (top 3)
2. Summary of key risks (top 3)
3. Risk mitigation strategies
4. Final recommendation: GO / NO-GO / CONDITIONAL
5. If conditional, what conditions must be met
6. Confidence level (1-10) and reasoning`
        }
      },
    ],
    edges: [
      { id: 'e1-3', source: 'node_1', target: 'node_3' },
      { id: 'e2-3', source: 'node_2', target: 'node_3' },
    ],
  },

  // ==========================================
  // EMAIL CHAIN PROCESSOR
  // ==========================================
  {
    id: 'template-email-processor',
    name: 'Email Chain Processor',
    description: 'Summarize long email threads and extract action items. Gemini summarizes, GPT-4 extracts structured tasks.',
    category: 'Productivity',
    tags: ['email', 'summary', 'action-items', 'meetings'],
    icon: '📧',
    isPublic: true,
    estimatedTime: 2,
    estimatedCost: '$0.01 - $0.02',
    costStrategy: 'Gemini handles the bulk summarization. GPT-4 only extracts the structured action items.',
    llmBreakdown: [
      { model: 'Gemini 2.5 Flash', role: 'Summarize email thread', costTier: 'low' },
      { model: 'GPT-4o', role: 'Extract action items as JSON', costTier: 'medium' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    inputVariables: [
      { name: 'emailThread', description: 'Paste the email chain', required: true },
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'aiNode',
        position: { x: 100, y: 100 },
        data: {
          label: '1. Gemini: Summarize Thread',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Summarize this email thread concisely:

{{emailThread}}

Provide:
1. Main topic/subject
2. Key participants and their positions
3. Decisions made
4. Open questions
5. Current status

Keep it brief - this feeds into action item extraction.`
        }
      },
      {
        id: 'node_2',
        type: 'aiNode',
        position: { x: 100, y: 300 },
        data: {
          label: '2. GPT-4: Extract Action Items',
          platform: 'chatgpt',
          model: 'gpt-4o',
          prompt: `Extract action items from this email summary.

Summary:
{{node_1}}

Return ONLY valid JSON:
{
  "actionItems": [
    {
      "task": "Description of the task",
      "owner": "Person responsible (or 'Unassigned')",
      "deadline": "Date if mentioned, or null",
      "priority": "high|medium|low",
      "status": "pending|in-progress|blocked"
    }
  ],
  "followUpDate": "Suggested follow-up date",
  "keyDecisions": ["Decision 1", "Decision 2"]
}`
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2' },
    ],
  },

  // ==========================================
  // COMPETITIVE ANALYSIS
  // ==========================================
  {
    id: 'template-competitor-analysis',
    name: 'Competitor Analysis Matrix',
    description: 'Analyze competitors with structured comparison. Gemini researches each, GPT-4 creates comparison matrix.',
    category: 'Research',
    tags: ['competitor', 'analysis', 'market', 'strategy'],
    icon: '🎯',
    isPublic: true,
    estimatedTime: 7,
    estimatedCost: '$0.04 - $0.08',
    costStrategy: 'Gemini handles parallel research on competitors. GPT-4 synthesizes into structured comparison matrix.',
    llmBreakdown: [
      { model: 'Gemini 2.5 Flash', role: 'Research your product', costTier: 'low' },
      { model: 'Gemini 2.5 Flash', role: 'Research competitors', costTier: 'low' },
      { model: 'GPT-4o', role: 'Create comparison matrix', costTier: 'medium' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    inputVariables: [
      { name: 'yourProduct', description: 'Your product/company', required: true },
      { name: 'competitors', description: 'Competitor names (comma-separated)', required: true },
      { name: 'criteria', description: 'Comparison criteria (optional)', required: false },
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'aiNode',
        position: { x: 50, y: 100 },
        data: {
          label: '1a. Gemini: Analyze Your Product',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Analyze this product/company for competitive comparison:

Product: {{yourProduct}}

Cover:
1. Core value proposition
2. Key features
3. Target audience
4. Pricing model (if known)
5. Strengths
6. Weaknesses
7. Recent developments

Be factual and objective.`
        }
      },
      {
        id: 'node_2',
        type: 'aiNode',
        position: { x: 350, y: 100 },
        data: {
          label: '1b. Gemini: Analyze Competitors',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Analyze these competitors:

Competitors: {{competitors}}

For each competitor, cover:
1. Core value proposition
2. Key features
3. Target audience
4. Pricing model (if known)
5. Strengths
6. Weaknesses
7. Market position

Be factual and objective. Analyze each separately.`
        }
      },
      {
        id: 'node_3',
        type: 'aiNode',
        position: { x: 200, y: 300 },
        data: {
          label: '2. GPT-4: Create Comparison Matrix',
          platform: 'chatgpt',
          model: 'gpt-4o',
          prompt: `Create a competitive analysis matrix from this research.

YOUR PRODUCT ANALYSIS:
{{node_1}}

COMPETITOR ANALYSES:
{{node_2}}

Comparison criteria: {{criteria}}

Return structured JSON:
{
  "comparisonMatrix": {
    "criteria": ["Feature 1", "Pricing", "Support", ...],
    "products": {
      "YourProduct": {"Feature 1": "rating/notes", ...},
      "Competitor1": {...}
    }
  },
  "yourStrengths": ["Where you win"],
  "yourWeaknesses": ["Where competitors win"],
  "opportunities": ["Market gaps you could fill"],
  "threats": ["Competitive risks"],
  "recommendations": ["Strategic actions"]
}`
        }
      },
    ],
    edges: [
      { id: 'e1-3', source: 'node_1', target: 'node_3' },
      { id: 'e2-3', source: 'node_2', target: 'node_3' },
    ],
  },

  // ==========================================
  // API DOCUMENTATION GENERATOR
  // ==========================================
  {
    id: 'template-api-docs',
    name: 'API Documentation Generator',
    description: 'Generate comprehensive API docs from code. Gemini extracts endpoints, GPT-4 creates OpenAPI spec.',
    category: 'Development',
    tags: ['api', 'documentation', 'openapi', 'swagger'],
    icon: '📚',
    isPublic: true,
    estimatedTime: 5,
    estimatedCost: '$0.02 - $0.05',
    costStrategy: 'Gemini parses and describes endpoints. GPT-4 generates valid OpenAPI JSON (requires precision).',
    llmBreakdown: [
      { model: 'Gemini 2.5 Flash', role: 'Parse code & describe endpoints', costTier: 'low' },
      { model: 'GPT-4o', role: 'Generate OpenAPI spec', costTier: 'medium' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    inputVariables: [
      { name: 'code', description: 'API code (routes, controllers)', required: true },
      { name: 'apiName', description: 'API name', required: true },
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'aiNode',
        position: { x: 100, y: 100 },
        data: {
          label: '1. Gemini: Parse & Describe',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Analyze this API code and describe all endpoints:

\`\`\`
{{code}}
\`\`\`

For each endpoint, provide:
1. HTTP Method (GET, POST, PUT, DELETE, etc.)
2. Path (including parameters)
3. Description of what it does
4. Request body structure (if applicable)
5. Response structure
6. Required headers or auth
7. Possible error responses

Be thorough - this will be used to generate OpenAPI docs.`
        }
      },
      {
        id: 'node_2',
        type: 'aiNode',
        position: { x: 100, y: 300 },
        data: {
          label: '2. GPT-4: Generate OpenAPI Spec',
          platform: 'chatgpt',
          model: 'gpt-4o',
          prompt: `Generate a valid OpenAPI 3.0 specification from this endpoint analysis.

API Name: {{apiName}}

Endpoint Analysis:
{{node_1}}

Requirements:
1. Output ONLY valid OpenAPI 3.0 JSON
2. Include all endpoints with proper schemas
3. Define reusable components/schemas
4. Include example requests/responses
5. Add security schemes if auth is mentioned

The output must be valid JSON that can be imported into Swagger UI.`
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2' },
    ],
  },

  // ==========================================
  // TRANSLATION WITH CONTEXT
  // ==========================================
  {
    id: 'template-smart-translation',
    name: 'Context-Aware Translation',
    description: 'Gemini handles translation, GPT-4 reviews for cultural accuracy and business context.',
    category: 'Writing',
    tags: ['translation', 'localization', 'international'],
    icon: '🌍',
    isPublic: true,
    estimatedTime: 3,
    estimatedCost: '$0.01 - $0.03',
    costStrategy: 'Gemini handles translation. GPT-4 reviews for cultural nuance and context.',
    llmBreakdown: [
      { model: 'Gemini 2.5 Flash', role: 'Primary translation', costTier: 'low' },
      { model: 'GPT-4o', role: 'Cultural/context review', costTier: 'medium' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    inputVariables: [
      { name: 'text', description: 'Text to translate', required: true },
      { name: 'targetLanguage', description: 'Target language', required: true },
      { name: 'context', description: 'Context (e.g., business email, marketing, technical)', required: false },
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'aiNode',
        position: { x: 100, y: 100 },
        data: {
          label: '1. Gemini: Translate',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Translate this text to {{targetLanguage}}:

Original text:
{{text}}

Context: {{context}}

Provide:
1. Main translation
2. 1-2 alternative phrasings for key sentences
3. Notes on any idioms or culturally-specific content`
        }
      },
      {
        id: 'node_2',
        type: 'aiNode',
        position: { x: 100, y: 300 },
        data: {
          label: '2. GPT-4: Cultural Review',
          platform: 'chatgpt',
          model: 'gpt-4o',
          prompt: `Review this translation for cultural accuracy and context-appropriateness.

Original (English):
{{text}}

Translation to {{targetLanguage}}:
{{node_1}}

Context: {{context}}

Check for:
1. Cultural appropriateness
2. Tone matching the context
3. Idioms that don't translate well
4. Any potentially offensive or awkward phrasings
5. Business/formal vs casual appropriateness

Provide final polished translation with any corrections, and explain changes made.`
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2' },
    ],
  },

  // ==========================================
  // MEETING NOTES TO TASKS
  // ==========================================
  {
    id: 'template-meeting-to-tasks',
    name: 'Meeting Notes → Project Tasks',
    description: 'Convert messy meeting notes into structured project tasks. Gemini summarizes, GPT-4 extracts tasks with dependencies.',
    category: 'Productivity',
    tags: ['meetings', 'tasks', 'project-management', 'productivity'],
    icon: '📋',
    isPublic: true,
    estimatedTime: 3,
    estimatedCost: '$0.01 - $0.03',
    costStrategy: 'Gemini processes the long notes. GPT-4 creates structured task output with dependencies.',
    llmBreakdown: [
      { model: 'Gemini 2.5 Flash', role: 'Summarize & identify tasks', costTier: 'low' },
      { model: 'GPT-4o', role: 'Structure tasks with dependencies', costTier: 'medium' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    inputVariables: [
      { name: 'notes', description: 'Meeting notes (paste raw notes)', required: true },
      { name: 'projectName', description: 'Project name', required: false },
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'aiNode',
        position: { x: 100, y: 100 },
        data: {
          label: '1. Gemini: Parse Meeting Notes',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Analyze these meeting notes and extract actionable items:

{{notes}}

Identify:
1. Action items mentioned (explicit and implied)
2. Who committed to what
3. Deadlines mentioned
4. Decisions made
5. Blockers or dependencies discussed
6. Follow-up needed

List everything that could become a task.`
        }
      },
      {
        id: 'node_2',
        type: 'aiNode',
        position: { x: 100, y: 300 },
        data: {
          label: '2. GPT-4: Create Task Structure',
          platform: 'chatgpt',
          model: 'gpt-4o',
          prompt: `Convert this meeting analysis into structured project tasks.

Project: {{projectName}}

Meeting Analysis:
{{node_1}}

Return valid JSON:
{
  "projectName": "...",
  "meetingDate": "...",
  "tasks": [
    {
      "id": "TASK-001",
      "title": "Task title",
      "description": "Details",
      "assignee": "Name or 'Unassigned'",
      "deadline": "Date or null",
      "priority": "high|medium|low",
      "dependencies": ["TASK-XXX"],
      "status": "todo"
    }
  ],
  "decisions": ["Key decisions made"],
  "blockers": ["Current blockers"],
  "nextMeeting": "Suggested follow-up date"
}`
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2' },
    ],
  },

  // ==========================================
  // RESUME ANALYZER
  // ==========================================
  {
    id: 'template-resume-analyzer',
    name: 'Resume Analyzer & Match Score',
    description: 'Analyze resumes against job requirements. Gemini extracts info, GPT-4 scores and provides feedback.',
    category: 'HR',
    tags: ['resume', 'hiring', 'recruitment', 'hr'],
    icon: '📄',
    isPublic: true,
    estimatedTime: 4,
    estimatedCost: '$0.02 - $0.04',
    costStrategy: 'Gemini parses resume text (bulk). GPT-4 does the scoring logic (needs reasoning).',
    llmBreakdown: [
      { model: 'Gemini 2.5 Flash', role: 'Extract resume information', costTier: 'low' },
      { model: 'GPT-4o', role: 'Score match & provide feedback', costTier: 'medium' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    inputVariables: [
      { name: 'resume', description: 'Resume text', required: true },
      { name: 'jobDescription', description: 'Job description', required: true },
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'aiNode',
        position: { x: 100, y: 100 },
        data: {
          label: '1. Gemini: Extract Resume Data',
          platform: 'gemini',
          model: 'gemini-2.5-flash',
          prompt: `Extract structured information from this resume:

{{resume}}

Extract:
1. Name and contact info
2. Summary/objective
3. Skills (technical and soft)
4. Work experience (company, title, dates, achievements)
5. Education
6. Certifications
7. Years of experience
8. Notable achievements

Be thorough - this feeds into job matching.`
        }
      },
      {
        id: 'node_2',
        type: 'aiNode',
        position: { x: 100, y: 300 },
        data: {
          label: '2. GPT-4: Score & Analyze',
          platform: 'chatgpt',
          model: 'gpt-4o',
          prompt: `Analyze this candidate against the job requirements.

EXTRACTED RESUME DATA:
{{node_1}}

JOB DESCRIPTION:
{{jobDescription}}

Provide JSON:
{
  "matchScore": 1-100,
  "matchLevel": "Strong Match|Good Match|Partial Match|Weak Match",
  "strengths": ["Where candidate excels"],
  "gaps": ["Missing skills or experience"],
  "redFlags": ["Concerns if any"],
  "interviewQuestions": ["Suggested questions based on gaps"],
  "recommendation": "Recommend for interview / Maybe / Pass",
  "summary": "2-3 sentence executive summary"
}`
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node_1', target: 'node_2' },
    ],
  },
];

// ============================================
// ZUSTAND STORE
// ============================================

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: costOptimizedTemplates,
      currentTemplate: null,
      isLoading: false,
      error: null,

      fetchTemplates: async () => {
        set({ isLoading: true, error: null });
        try {
          // For now, use the built-in cost-optimized templates
          // In the future, this could fetch from an API
          set({ templates: costOptimizedTemplates, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch templates:', error);
          set({ error: 'Failed to fetch templates', isLoading: false });
        }
      },

      setCurrentTemplate: (template) => {
        set({ currentTemplate: template });
      },
      
      updateCurrentTemplate: (updates) => {
        const current = get().currentTemplate;
        if (current) {
          set({ currentTemplate: { ...current, ...updates } });
        }
      },
      
      saveTemplate: async (template) => {
        set({ isLoading: true, error: null });
        try {
          const templates = get().templates;
          const existingIndex = templates.findIndex(t => t.id === template.id);
          
          if (existingIndex >= 0) {
            templates[existingIndex] = template;
          } else {
            templates.push(template);
          }
          
          set({ templates: [...templates], isLoading: false });
        } catch (error) {
          console.error('Failed to save template:', error);
          set({ error: 'Failed to save template', isLoading: false });
        }
      },
      
      deleteTemplate: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const templates = get().templates.filter(t => t.id !== id);
          set({ templates, isLoading: false });
        } catch (error) {
          console.error('Failed to delete template:', error);
          set({ error: 'Failed to delete template', isLoading: false });
        }
      },
      
      getTemplateById: (id) => {
        return get().templates.find(t => t.id === id);
      },
      
      duplicateTemplate: async (id) => {
        const template = get().getTemplateById(id);
        if (template) {
          const newTemplate: WorkflowTemplate = {
            ...template,
            id: `${template.id}-copy-${Date.now()}`,
            name: `${template.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await get().saveTemplate(newTemplate);
        }
      },
    }),
    {
      name: 'taskweave-templates',
      partialize: (state) => ({
        // Don't persist templates - always use latest built-in ones
        currentTemplate: state.currentTemplate,
      }),
    }
  )
);
