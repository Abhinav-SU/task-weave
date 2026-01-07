import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  GitBranch, 
  Zap, 
  Merge, 
  Bot, 
  Globe, 
  Database, 
  FileCode,
  Search,
  Code,
  FileText,
  Sparkles,
  DollarSign,
  Clock,
  Cpu,
  Wrench,
  Package
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================
// LLM DEFINITIONS WITH COST & CAPABILITIES
// ============================================
const llmModels = [
  {
    id: 'gemini-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    icon: '✨',
    costTier: 'low',
    costPerMToken: '$0.075',
    bestFor: ['Drafts', 'Summarization', 'Bulk processing', 'Translation'],
    color: 'bg-purple-500/20 border-purple-500',
    description: 'Fast & cheap. Great for high-volume tasks.',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    icon: '🤖',
    costTier: 'medium',
    costPerMToken: '$2.50',
    bestFor: ['JSON extraction', 'Code review', 'Structured output', 'Reasoning'],
    color: 'bg-green-500/20 border-green-500',
    description: 'Best for structured data and complex logic.',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    icon: '💬',
    costTier: 'low',
    costPerMToken: '$0.15',
    bestFor: ['Simple tasks', 'Classification', 'Quick responses'],
    color: 'bg-green-500/20 border-green-500',
    description: 'Cheaper GPT-4 for simpler tasks.',
  },
  {
    id: 'claude-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    icon: '🎭',
    costTier: 'high',
    costPerMToken: '$3.00',
    bestFor: ['Long context', 'Analysis', 'Writing quality', 'Safety'],
    color: 'bg-blue-500/20 border-blue-500',
    description: 'Best writing quality. 200K context.',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    provider: 'Perplexity',
    icon: '🔍',
    costTier: 'medium',
    costPerMToken: '$1.00',
    bestFor: ['Web search', 'Current info', 'Research', 'Fact-checking'],
    color: 'bg-orange-500/20 border-orange-500',
    description: 'Real-time web search capabilities.',
  },
];

// ============================================
// NODE TYPE DEFINITIONS
// ============================================
const basicNodes = [
  {
    type: 'ai-platform',
    icon: MessageSquare,
    label: 'AI Node',
    color: 'text-green-500',
    description: 'Call any LLM with a prompt',
    category: 'basic',
  },
  {
    type: 'condition',
    icon: GitBranch,
    label: 'Condition',
    color: 'text-yellow-500',
    description: 'Branch based on logic',
    category: 'basic',
  },
  {
    type: 'transform',
    icon: Zap,
    label: 'Transform',
    color: 'text-cyan-500',
    description: 'Modify data between nodes',
    category: 'basic',
  },
  {
    type: 'merge',
    icon: Merge,
    label: 'Merge',
    color: 'text-violet-500',
    description: 'Combine multiple outputs',
    category: 'basic',
  },
];

const agentNodes = [
  {
    type: 'agent',
    icon: Bot,
    label: 'AI Agent',
    color: 'text-pink-500',
    description: 'Autonomous agent with tools',
    category: 'agent',
    badge: 'NEW',
  },
  {
    type: 'agent-planner',
    icon: Cpu,
    label: 'Planner Agent',
    color: 'text-indigo-500',
    description: 'Plans multi-step tasks',
    category: 'agent',
  },
  {
    type: 'agent-executor',
    icon: Wrench,
    label: 'Executor Agent',
    color: 'text-amber-500',
    description: 'Executes planned steps',
    category: 'agent',
  },
];

const mcpTools = [
  {
    type: 'mcp-web-search',
    icon: Globe,
    label: 'Web Search',
    color: 'text-blue-500',
    description: 'Search the web in real-time',
    category: 'mcp',
    mcpServer: 'web-search',
  },
  {
    type: 'mcp-file',
    icon: FileCode,
    label: 'File Operations',
    color: 'text-green-500',
    description: 'Read/write files',
    category: 'mcp',
    mcpServer: 'filesystem',
  },
  {
    type: 'mcp-database',
    icon: Database,
    label: 'Database Query',
    color: 'text-orange-500',
    description: 'Query databases',
    category: 'mcp',
    mcpServer: 'database',
  },
  {
    type: 'mcp-code-exec',
    icon: Code,
    label: 'Code Execution',
    color: 'text-red-500',
    description: 'Run code safely',
    category: 'mcp',
    mcpServer: 'code-runner',
  },
];

// ============================================
// PRE-BUILT PATTERNS (Templates within templates)
// ============================================
const patterns = [
  {
    id: 'pattern-research',
    name: 'Research Pattern',
    icon: '🔬',
    description: 'Gemini researches → GPT-4 validates',
    nodes: [
      { type: 'ai-platform', data: { platform: 'gemini', label: 'Research' } },
      { type: 'ai-platform', data: { platform: 'chatgpt', label: 'Validate' } },
    ],
    costEstimate: '$0.02-0.04',
  },
  {
    id: 'pattern-draft-polish',
    name: 'Draft & Polish',
    icon: '✍️',
    description: 'Gemini drafts → GPT-4 polishes',
    nodes: [
      { type: 'ai-platform', data: { platform: 'gemini', label: 'Draft' } },
      { type: 'ai-platform', data: { platform: 'chatgpt', label: 'Polish' } },
    ],
    costEstimate: '$0.01-0.03',
  },
  {
    id: 'pattern-parallel-analysis',
    name: 'Parallel Analysis',
    icon: '⚖️',
    description: '2x Gemini (different angles) → GPT-4 synthesize',
    nodes: [
      { type: 'ai-platform', data: { platform: 'gemini', label: 'Pros' } },
      { type: 'ai-platform', data: { platform: 'gemini', label: 'Cons' } },
      { type: 'merge', data: { label: 'Combine' } },
      { type: 'ai-platform', data: { platform: 'chatgpt', label: 'Synthesize' } },
    ],
    costEstimate: '$0.03-0.05',
  },
  {
    id: 'pattern-extract-structure',
    name: 'Extract & Structure',
    icon: '📊',
    description: 'Gemini cleans → GPT-4 extracts JSON',
    nodes: [
      { type: 'ai-platform', data: { platform: 'gemini', label: 'Clean Input' } },
      { type: 'ai-platform', data: { platform: 'chatgpt', label: 'Extract JSON' } },
    ],
    costEstimate: '$0.01-0.02',
  },
  {
    id: 'pattern-agent-research',
    name: 'Agent + Research',
    icon: '🤖',
    description: 'Agent with web search for research',
    nodes: [
      { type: 'mcp-web-search', data: { label: 'Search Web' } },
      { type: 'agent', data: { label: 'Research Agent' } },
      { type: 'ai-platform', data: { platform: 'chatgpt', label: 'Summarize' } },
    ],
    costEstimate: '$0.05-0.10',
    badge: 'NEW',
  },
];

// ============================================
// COMPONENT
// ============================================
export const NodePalette = () => {
  const [activeTab, setActiveTab] = useState('nodes');

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData?: any) => {
    const data = JSON.stringify({ type: nodeType, data: nodeData || {} });
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('node-data', JSON.stringify(nodeData || {}));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onPatternDragStart = (event: React.DragEvent, pattern: typeof patterns[0]) => {
    event.dataTransfer.setData('pattern', JSON.stringify(pattern));
    event.dataTransfer.effectAllowed = 'move';
  };

  const costTierBadge = (tier: string) => {
    const colors = {
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const icons = { low: '💰', medium: '💵', high: '💎' };
    return (
      <Badge className={`text-xs ${colors[tier as keyof typeof colors]}`}>
        {icons[tier as keyof typeof icons]} {tier}
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="p-3 border-b">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="nodes" className="text-xs">Nodes</TabsTrigger>
              <TabsTrigger value="llms" className="text-xs">LLMs</TabsTrigger>
              <TabsTrigger value="patterns" className="text-xs">Patterns</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <TabsContent value="nodes" className="p-3 m-0 space-y-4">
              {/* Basic Nodes */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  Basic
                </h4>
                <div className="space-y-1.5">
                  {basicNodes.map((node) => (
                    <DraggableNode key={node.type} node={node} onDragStart={onDragStart} />
                  ))}
                </div>
              </div>

              {/* Agent Nodes */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
                  Agents
                  <Badge variant="secondary" className="text-[10px]">Beta</Badge>
                </h4>
                <div className="space-y-1.5">
                  {agentNodes.map((node) => (
                    <DraggableNode key={node.type} node={node} onDragStart={onDragStart} />
                  ))}
                </div>
              </div>

              {/* MCP Tools */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
                  MCP Tools
                  <Badge variant="secondary" className="text-[10px]">New</Badge>
                </h4>
                <div className="space-y-1.5">
                  {mcpTools.map((node) => (
                    <DraggableNode key={node.type} node={node} onDragStart={onDragStart} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="llms" className="p-3 m-0 space-y-2">
              <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Drag an LLM to create a pre-configured AI node with cost-optimized settings.
                </p>
              </div>
              
              {llmModels.map((llm) => (
                <Tooltip key={llm.id}>
                  <TooltipTrigger asChild>
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, 'ai-platform', { 
                        platform: llm.id.includes('gpt') ? 'chatgpt' : 
                                 llm.id.includes('gemini') ? 'gemini' :
                                 llm.id.includes('claude') ? 'claude' : 'perplexity',
                        model: llm.id,
                        label: llm.name,
                      })}
                      className={`p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${llm.color}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{llm.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{llm.name}</div>
                            <div className="text-xs text-muted-foreground">{llm.provider}</div>
                          </div>
                        </div>
                        {costTierBadge(llm.costTier)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <DollarSign className="w-3 h-3" />
                        {llm.costPerMToken}/1M tokens
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {llm.bestFor.slice(0, 3).map((use) => (
                          <Badge key={use} variant="outline" className="text-[10px] py-0">
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="font-semibold">{llm.name}</p>
                    <p className="text-sm text-muted-foreground">{llm.description}</p>
                    <p className="text-sm mt-2"><strong>Best for:</strong> {llm.bestFor.join(', ')}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TabsContent>

            <TabsContent value="patterns" className="p-3 m-0 space-y-2">
              <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Drag a pattern to add a pre-built multi-node workflow. Great starting points!
                </p>
              </div>

              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  draggable
                  onDragStart={(e) => onPatternDragStart(e, pattern)}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{pattern.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{pattern.name}</div>
                        {pattern.badge && (
                          <Badge variant="secondary" className="text-[10px] mt-0.5">
                            {pattern.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20">
                      {pattern.costEstimate}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {pattern.description}
                  </p>
                  
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {pattern.nodes.length} nodes
                    </span>
                  </div>
                </div>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </Card>
    </TooltipProvider>
  );
};

// Draggable Node Component
interface DraggableNodeProps {
  node: {
    type: string;
    icon: any;
    label: string;
    color: string;
    description: string;
    badge?: string;
  };
  onDragStart: (event: React.DragEvent, type: string, data?: any) => void;
}

function DraggableNode({ node, onDragStart }: DraggableNodeProps) {
  const Icon = node.icon;
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.type)}
      className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-all group"
    >
      <div className={`p-1.5 rounded-md bg-muted ${node.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm">{node.label}</span>
          {node.badge && (
            <Badge variant="secondary" className="text-[10px] py-0">
              {node.badge}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {node.description}
        </div>
      </div>
    </div>
  );
}
