import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export const TransformNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as any;
  
  return (
    <Card
      className={`min-w-[200px] p-4 bg-cyan-500/20 border-cyan-500 border-2 transition-all ${
        selected ? 'shadow-glow ring-2 ring-primary' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        <div className="flex-1">
          <div className="font-bold text-sm">{nodeData.label || 'Transform'}</div>
        </div>
      </div>

      {nodeData.operation && (
        <div className="text-xs text-muted-foreground mt-2 capitalize">
          Operation: {nodeData.operation}
        </div>
      )}

      {nodeData.ratio !== undefined && (
        <div className="text-xs text-muted-foreground">
          Ratio: {(nodeData.ratio * 100).toFixed(0)}%
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
});

TransformNode.displayName = 'TransformNode';
