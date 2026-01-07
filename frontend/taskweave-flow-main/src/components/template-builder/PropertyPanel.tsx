import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Node } from '@xyflow/react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Lightbulb, 
  DollarSign, 
  Zap, 
  AlertCircle,
  Sparkles,
  Bot,
  Wrench
} from 'lucide-react';

interface PropertyPanelProps {
  selectedNode: Node | null;
  onUpdate: (nodeId: string, data: any) => void;
}

// ============================================
// LLM CONFIGURATION DATA
// ============================================
const llmModels = {
  chatgpt: [
    { id: 'gpt-4o', name: 'GPT-4o', cost: 'medium', bestFor: 'Structured output, reasoning' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', cost: 'low', bestFor: 'Simple tasks, fast responses' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', cost: 'high', bestFor: 'Complex reasoning' },
  ],
  gemini: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', cost: 'low', bestFor: 'Bulk work, drafts' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', cost: 'medium', bestFor: 'Complex analysis' },
  ],
  claude: [
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', cost: 'high', bestFor: 'Long context, writing' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', cost: 'low', bestFor: 'Fast, simple tasks' },
  ],
  perplexity: [
    { id: 'pplx-online', name: 'Perplexity Online', cost: 'medium', bestFor: 'Web search, research' },
  ],
};

const taskSuggestions: Record<string, { platform: string; model: string; reason: string }> = {
  'draft': { platform: 'gemini', model: 'gemini-2.5-flash', reason: 'Cheap & fast for initial drafts' },
  'research': { platform: 'gemini', model: 'gemini-2.5-flash', reason: 'Good at synthesis, low cost' },
  'summarize': { platform: 'gemini', model: 'gemini-2.5-flash', reason: 'Excellent at summarization' },
  'extract': { platform: 'chatgpt', model: 'gpt-4o', reason: 'Best at structured JSON output' },
  'validate': { platform: 'chatgpt', model: 'gpt-4o', reason: 'Strong reasoning for validation' },
  'code': { platform: 'chatgpt', model: 'gpt-4o', reason: 'Excellent code understanding' },
  'security': { platform: 'chatgpt', model: 'gpt-4o', reason: 'Deep security analysis' },
  'polish': { platform: 'chatgpt', model: 'gpt-4o-mini', reason: 'Good quality at lower cost' },
  'translate': { platform: 'gemini', model: 'gemini-2.5-flash', reason: 'Multilingual, cost-effective' },
  'write': { platform: 'claude', model: 'claude-3-5-sonnet', reason: 'Best writing quality' },
  'analyze': { platform: 'claude', model: 'claude-3-5-sonnet', reason: 'Deep analysis, long context' },
  'search': { platform: 'perplexity', model: 'pplx-online', reason: 'Real-time web search' },
};

// Available MCP tools
const mcpTools = [
  { id: 'web-search', name: 'Web Search', description: 'Search the internet' },
  { id: 'file-read', name: 'File Read', description: 'Read file contents' },
  { id: 'file-write', name: 'File Write', description: 'Write to files' },
  { id: 'code-execute', name: 'Code Execute', description: 'Run code' },
  { id: 'database-query', name: 'Database Query', description: 'Query databases' },
  { id: 'api-call', name: 'API Call', description: 'Make HTTP requests' },
];

export const PropertyPanel = ({ selectedNode, onUpdate }: PropertyPanelProps) => {
  if (!selectedNode) {
    return (
      <Card className="p-6 h-full">
        <div className="text-center text-muted-foreground">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Select a node to edit its properties</p>
        </div>
      </Card>
    );
  }

  const handleChange = (key: string, value: any) => {
    onUpdate(selectedNode.id, {
      ...selectedNode.data,
      [key]: value,
    });
  };

  const getSuggestion = (label: string): typeof taskSuggestions[string] | null => {
    const lowerLabel = label?.toLowerCase() || '';
    for (const [keyword, suggestion] of Object.entries(taskSuggestions)) {
      if (lowerLabel.includes(keyword)) {
        return suggestion;
      }
    }
    return null;
  };

  const applySuggestion = () => {
    const suggestion = getSuggestion(String(selectedNode.data.label || ''));
    if (suggestion) {
      onUpdate(selectedNode.id, {
        ...selectedNode.data,
        platform: suggestion.platform,
        model: suggestion.model,
      });
    }
  };

  const renderAIPlatformProperties = () => {
    const suggestion = getSuggestion(String(selectedNode.data.label || ''));
    const currentPlatform = String(selectedNode.data.platform || 'chatgpt');
    const models = llmModels[currentPlatform as keyof typeof llmModels] || [];
    const currentModel = models.find(m => m.id === selectedNode.data.model);

    return (
      <>
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={String(selectedNode.data.label || '')}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="What does this node do?"
          />
        </div>

        {/* Smart Suggestion */}
        {suggestion && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Suggested: {suggestion.platform === 'gemini' ? 'Gemini' : suggestion.platform === 'chatgpt' ? 'GPT-4' : suggestion.platform}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  {suggestion.reason}
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 h-7 text-xs"
                  onClick={applySuggestion}
                >
                  Apply Suggestion
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>AI Platform</Label>
          <Select
            value={currentPlatform}
            onValueChange={(v) => {
              handleChange('platform', v);
              // Reset model when platform changes
              const newModels = llmModels[v as keyof typeof llmModels];
              if (newModels?.length > 0) {
                handleChange('model', newModels[0].id);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <span>Gemini</span>
                  <Badge className="ml-2 text-[10px] bg-green-100 text-green-700">💰 Cheap</Badge>
                </div>
              </SelectItem>
              <SelectItem value="chatgpt">
                <div className="flex items-center gap-2">
                  <span>🤖</span>
                  <span>ChatGPT</span>
                  <Badge className="ml-2 text-[10px] bg-amber-100 text-amber-700">💵 Medium</Badge>
                </div>
              </SelectItem>
              <SelectItem value="claude">
                <div className="flex items-center gap-2">
                  <span>🎭</span>
                  <span>Claude</span>
                  <Badge className="ml-2 text-[10px] bg-red-100 text-red-700">💎 Premium</Badge>
                </div>
              </SelectItem>
              <SelectItem value="perplexity">
                <div className="flex items-center gap-2">
                  <span>🔍</span>
                  <span>Perplexity</span>
                  <Badge className="ml-2 text-[10px] bg-orange-100 text-orange-700">🌐 Search</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {models.length > 0 && (
          <div className="space-y-2">
            <Label>Model</Label>
            <Select
              value={String(selectedNode.data.model || models[0]?.id)}
              onValueChange={(v) => handleChange('model', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                        <Badge 
                          className={`text-[10px] ${
                            model.cost === 'low' ? 'bg-green-100 text-green-700' :
                            model.cost === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {model.cost === 'low' ? '💰' : model.cost === 'medium' ? '💵' : '💎'}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentModel && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Best for: {currentModel.bestFor}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Prompt Template</Label>
          <Textarea
            value={String(selectedNode.data.prompt || '')}
            onChange={(e) => handleChange('prompt', e.target.value)}
            placeholder="Enter prompt with {{variables}}"
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Use {`{{variable_name}}`} for inputs, {`{{node_1}}`} for previous node output
          </p>
        </div>

        <div className="space-y-2">
          <Label>Max Tokens</Label>
          <Input
            type="number"
            value={String(selectedNode.data.maxTokens || 1000)}
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
            placeholder="1000"
          />
        </div>

        <div className="space-y-2">
          <Label>Temperature: {(Number(selectedNode.data.temperature) || 0.7).toFixed(1)}</Label>
          <Slider
            value={[Number(selectedNode.data.temperature || 0.7) * 100]}
            onValueChange={(v) => handleChange('temperature', v[0] / 100)}
            max={100}
            step={5}
          />
          <p className="text-xs text-muted-foreground">
            Lower = more focused, Higher = more creative
          </p>
        </div>
      </>
    );
  };

  const renderAgentProperties = () => (
    <>
      <div className="space-y-2">
        <Label>Agent Name</Label>
        <Input
          value={String(selectedNode.data.label || '')}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="Research Agent"
        />
      </div>

      <div className="space-y-2">
        <Label>Agent Goal</Label>
        <Textarea
          value={String(selectedNode.data.goal || '')}
          onChange={(e) => handleChange('goal', e.target.value)}
          placeholder="What should this agent accomplish?"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Base Model</Label>
        <Select
          value={String(selectedNode.data.model || 'gpt-4o')}
          onValueChange={(v) => handleChange('model', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
            <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
            <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Agents work best with powerful reasoning models
        </p>
      </div>

      <div className="space-y-2">
        <Label>Available Tools</Label>
        <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
          {mcpTools.map((tool) => {
            const isSelected = (selectedNode.data.tools as string[] || []).includes(tool.id);
            return (
              <div key={tool.id} className="flex items-center gap-2">
                <Checkbox
                  id={tool.id}
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    const currentTools = (selectedNode.data.tools as string[]) || [];
                    const newTools = checked
                      ? [...currentTools, tool.id]
                      : currentTools.filter(t => t !== tool.id);
                    handleChange('tools', newTools);
                  }}
                />
                <label htmlFor={tool.id} className="flex-1 cursor-pointer">
                  <div className="text-sm font-medium">{tool.name}</div>
                  <div className="text-xs text-muted-foreground">{tool.description}</div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Max Iterations</Label>
        <Input
          type="number"
          value={String(selectedNode.data.maxIterations || 5)}
          onChange={(e) => handleChange('maxIterations', parseInt(e.target.value))}
          min={1}
          max={20}
        />
        <p className="text-xs text-muted-foreground">
          Maximum planning/execution cycles
        </p>
      </div>
    </>
  );

  const renderMCPToolProperties = () => {
    const toolType = selectedNode.type;
    
    return (
      <>
        <div className="space-y-2">
          <Label>Tool Label</Label>
          <Input
            value={String(selectedNode.data.label || '')}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Tool name"
          />
        </div>

        {toolType === 'mcp-web-search' && (
          <>
            <div className="space-y-2">
              <Label>Search Query Template</Label>
              <Input
                value={String(selectedNode.data.query || '')}
                onChange={(e) => handleChange('query', e.target.value)}
                placeholder="{{topic}} latest news 2025"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Results</Label>
              <Input
                type="number"
                value={String(selectedNode.data.maxResults || 5)}
                onChange={(e) => handleChange('maxResults', parseInt(e.target.value))}
              />
            </div>
          </>
        )}

        {toolType === 'mcp-file' && (
          <>
            <div className="space-y-2">
              <Label>File Path</Label>
              <Input
                value={String(selectedNode.data.path || '')}
                onChange={(e) => handleChange('path', e.target.value)}
                placeholder="/path/to/file.txt"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select
                value={String(selectedNode.data.operation || 'read')}
                onValueChange={(v) => handleChange('operation', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="write">Write</SelectItem>
                  <SelectItem value="append">Append</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {toolType === 'mcp-database' && (
          <>
            <div className="space-y-2">
              <Label>SQL Query</Label>
              <Textarea
                value={String(selectedNode.data.query || '')}
                onChange={(e) => handleChange('query', e.target.value)}
                placeholder="SELECT * FROM users WHERE..."
                rows={4}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Database Connection</Label>
              <Select
                value={String(selectedNode.data.connection || 'default')}
                onValueChange={(v) => handleChange('connection', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="analytics">Analytics DB</SelectItem>
                  <SelectItem value="production">Production (Read Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {toolType === 'mcp-code-exec' && (
          <>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={String(selectedNode.data.language || 'python')}
                onValueChange={(v) => handleChange('language', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="bash">Bash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Code Template</Label>
              <Textarea
                value={String(selectedNode.data.code || '')}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="# Code to execute"
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">Code runs in sandboxed environment</span>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  const renderConditionProperties = () => (
    <>
      <div className="space-y-2">
        <Label>Label</Label>
        <Input
          value={String(selectedNode.data.label || '')}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="Condition name"
        />
      </div>

      <div className="space-y-2">
        <Label>Condition Variable</Label>
        <Input
          value={String(selectedNode.data.variable || '')}
          onChange={(e) => handleChange('variable', e.target.value)}
          placeholder="e.g., node_1.length, result.score"
        />
      </div>

      <div className="space-y-2">
        <Label>Operation</Label>
        <Select
          value={String(selectedNode.data.operation || 'greater_than')}
          onValueChange={(v) => handleChange('operation', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="greater_than">Greater Than</SelectItem>
            <SelectItem value="less_than">Less Than</SelectItem>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="is_empty">Is Empty</SelectItem>
            <SelectItem value="not_empty">Not Empty</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Compare Value</Label>
        <Input
          value={String(selectedNode.data.compareValue || '')}
          onChange={(e) => handleChange('compareValue', e.target.value)}
          placeholder="Value to compare against"
        />
      </div>
    </>
  );

  const renderTransformProperties = () => (
    <>
      <div className="space-y-2">
        <Label>Label</Label>
        <Input
          value={String(selectedNode.data.label || '')}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="Transform operation"
        />
      </div>

      <div className="space-y-2">
        <Label>Operation</Label>
        <Select
          value={String(selectedNode.data.operation || 'extract')}
          onValueChange={(v) => handleChange('operation', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="extract">Extract Field</SelectItem>
            <SelectItem value="format">Format Template</SelectItem>
            <SelectItem value="parse_json">Parse JSON</SelectItem>
            <SelectItem value="join">Join Arrays</SelectItem>
            <SelectItem value="split">Split Text</SelectItem>
            <SelectItem value="filter">Filter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Transform Expression</Label>
        <Input
          value={String(selectedNode.data.expression || '')}
          onChange={(e) => handleChange('expression', e.target.value)}
          placeholder="e.g., data.results[0].text"
        />
      </div>
    </>
  );

  const renderMergeProperties = () => (
    <>
      <div className="space-y-2">
        <Label>Label</Label>
        <Input
          value={String(selectedNode.data.label || '')}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="Merge operation"
        />
      </div>

      <div className="space-y-2">
        <Label>Merge Strategy</Label>
        <Select
          value={String(selectedNode.data.strategy || 'concatenate')}
          onValueChange={(v) => handleChange('strategy', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="concatenate">Concatenate</SelectItem>
            <SelectItem value="object">Merge as Object</SelectItem>
            <SelectItem value="array">Merge as Array</SelectItem>
            <SelectItem value="pick_first">Pick First Non-Empty</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        This node combines outputs from all connected input nodes.
      </div>
    </>
  );

  const nodeType = selectedNode.type;
  const isAgent = nodeType?.startsWith('agent');
  const isMCP = nodeType?.startsWith('mcp-');

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-bold">Node Properties</h3>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {nodeType}
          </Badge>
          <span className="text-xs text-muted-foreground">
            ID: {selectedNode.id}
          </span>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {nodeType === 'ai-platform' && renderAIPlatformProperties()}
          {isAgent && renderAgentProperties()}
          {isMCP && renderMCPToolProperties()}
          {nodeType === 'condition' && renderConditionProperties()}
          {nodeType === 'transform' && renderTransformProperties()}
          {nodeType === 'merge' && renderMergeProperties()}
        </div>
      </ScrollArea>
    </Card>
  );
};
