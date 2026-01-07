import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, FileCode, Database, Code, Server } from 'lucide-react';

const mcpTools: Record<string, { 
  icon: typeof Globe; 
  color: string; 
  label: string;
  description: string;
  server: string;
}> = {
  'mcp-web-search': { 
    icon: Globe, 
    color: 'bg-blue-500/20 border-blue-500', 
    label: 'Web Search',
    description: 'Search the web in real-time',
    server: 'web-search'
  },
  'mcp-file': { 
    icon: FileCode, 
    color: 'bg-green-500/20 border-green-500', 
    label: 'File Operations',
    description: 'Read/write files',
    server: 'filesystem'
  },
  'mcp-database': { 
    icon: Database, 
    color: 'bg-orange-500/20 border-orange-500', 
    label: 'Database Query',
    description: 'Query databases',
    server: 'database'
  },
  'mcp-code-exec': { 
    icon: Code, 
    color: 'bg-red-500/20 border-red-500', 
    label: 'Code Execution',
    description: 'Run code safely',
    server: 'code-runner'
  },
};

export const MCPToolNode = memo(({ data, selected, type }: NodeProps) => {
  const nodeData = data as any;
  const tool = mcpTools[type as string] || {
    icon: Server,
    color: 'bg-gray-500/20 border-gray-500',
    label: 'MCP Tool',
    description: 'Custom MCP tool',
    server: 'custom'
  };
  const Icon = tool.icon;

  return (
    <Card
      className={`min-w-[200px] p-4 ${tool.color} border-2 transition-all ${
        selected ? 'shadow-glow ring-2 ring-primary' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-background/50 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm">{nodeData.label || tool.label}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              MCP
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {tool.server}
            </Badge>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-2">
        {nodeData.description || tool.description}
      </div>

      {/* Tool-specific config */}
      {type === 'mcp-web-search' && nodeData.query && (
        <div className="text-xs bg-background/30 p-2 rounded mb-2">
          <span className="font-medium">Query:</span> {nodeData.query}
        </div>
      )}

      {type === 'mcp-file' && nodeData.path && (
        <div className="text-xs bg-background/30 p-2 rounded mb-2 font-mono">
          {nodeData.path}
        </div>
      )}

      {type === 'mcp-database' && nodeData.query && (
        <div className="text-xs bg-background/30 p-2 rounded mb-2 font-mono line-clamp-2">
          {nodeData.query}
        </div>
      )}

      {type === 'mcp-code-exec' && nodeData.language && (
        <Badge variant="outline" className="text-[10px]">
          {nodeData.language}
        </Badge>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
});

MCPToolNode.displayName = 'MCPToolNode';

