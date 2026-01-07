import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Wrench, Zap } from 'lucide-react';

const agentTypes: Record<string, { icon: typeof Bot; color: string; label: string }> = {
  'agent': { icon: Bot, color: 'bg-pink-500/20 border-pink-500', label: 'AI Agent' },
  'agent-planner': { icon: Zap, color: 'bg-indigo-500/20 border-indigo-500', label: 'Planner' },
  'agent-executor': { icon: Wrench, color: 'bg-amber-500/20 border-amber-500', label: 'Executor' },
};

export const AgentNode = memo(({ data, selected, type }: NodeProps) => {
  const nodeData = data as any;
  const agentType = agentTypes[type as string] || agentTypes['agent'];
  const Icon = agentType.icon;

  return (
    <Card
      className={`min-w-[220px] p-4 ${agentType.color} border-2 transition-all ${
        selected ? 'shadow-glow ring-2 ring-primary' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-background/50 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm">{nodeData.label || agentType.label}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="secondary" className="text-[10px]">
              Agent
            </Badge>
            {nodeData.tools?.length > 0 && (
              <Badge variant="outline" className="text-[10px]">
                {nodeData.tools.length} tools
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Agent Goal */}
      {nodeData.goal && (
        <div className="text-xs text-muted-foreground mb-2 line-clamp-2 bg-background/30 p-2 rounded">
          <span className="font-medium">Goal:</span> {nodeData.goal}
        </div>
      )}

      {/* Tools List */}
      {nodeData.tools && nodeData.tools.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {nodeData.tools.slice(0, 3).map((tool: string) => (
            <Badge key={tool} variant="outline" className="text-[10px] py-0">
              🔧 {tool}
            </Badge>
          ))}
          {nodeData.tools.length > 3 && (
            <Badge variant="outline" className="text-[10px] py-0">
              +{nodeData.tools.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Model */}
      {nodeData.model && (
        <div className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/50">
          Model: {nodeData.model}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
});

AgentNode.displayName = 'AgentNode';

