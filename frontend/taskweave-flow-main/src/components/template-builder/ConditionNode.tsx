import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as any;
  
  return (
    <Card
      className={`min-w-[200px] p-4 bg-yellow-500/20 border-yellow-500 border-2 transition-all ${
        selected ? 'shadow-glow ring-2 ring-primary' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <div className="flex-1">
          <div className="font-bold text-sm">{nodeData.label || 'Condition'}</div>
        </div>
      </div>

      {nodeData.condition && (
        <div className="text-xs text-muted-foreground mt-2 font-mono bg-muted/50 p-2 rounded">
          {nodeData.condition}
        </div>
      )}

      <div className="flex justify-between mt-3">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="w-3 h-3 -left-2"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="w-3 h-3 -right-2"
        />
      </div>
    </Card>
  );
});

ConditionNode.displayName = 'ConditionNode';
