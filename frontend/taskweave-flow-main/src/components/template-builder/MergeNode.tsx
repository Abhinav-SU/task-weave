import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Merge } from 'lucide-react';

export const MergeNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as any;
  
  return (
    <Card
      className={`min-w-[200px] p-4 bg-violet-500/20 border-violet-500 border-2 transition-all ${
        selected ? 'shadow-glow ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex justify-between mb-3">
        <Handle
          type="target"
          position={Position.Top}
          id="input1"
          className="w-3 h-3 -left-2"
        />
        <Handle
          type="target"
          position={Position.Top}
          id="input2"
          className="w-3 h-3 -right-2"
        />
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <Merge className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        <div className="flex-1">
          <div className="font-bold text-sm">{nodeData.label || 'Merge'}</div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        Combines multiple branches
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
});

MergeNode.displayName = 'MergeNode';
