import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const platformIcons: Record<string, string> = {
  chatgpt: '💬',
  claude: '🤖',
  gemini: '✨',
  perplexity: '🔍',
  cursor: '⚡',
};

const platformColors: Record<string, string> = {
  chatgpt: 'bg-green-500/20 border-green-500',
  claude: 'bg-blue-500/20 border-blue-500',
  gemini: 'bg-purple-500/20 border-purple-500',
  perplexity: 'bg-orange-500/20 border-orange-500',
  cursor: 'bg-pink-500/20 border-pink-500',
};

export const AIPlatformNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as any;
  const platform = nodeData.platform || 'chatgpt';
  const colorClass = platformColors[platform] || 'bg-primary/20 border-primary';

  return (
    <Card
      className={`min-w-[200px] p-4 ${colorClass} border-2 transition-all ${
        selected ? 'shadow-glow ring-2 ring-primary' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{platformIcons[platform]}</span>
        <div className="flex-1">
          <div className="font-bold text-sm">{nodeData.label || 'AI Platform'}</div>
          <Badge variant="secondary" className="text-xs capitalize mt-1">
            {platform}
          </Badge>
        </div>
      </div>

      {nodeData.prompt && (
        <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {nodeData.prompt}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
});

AIPlatformNode.displayName = 'AIPlatformNode';
