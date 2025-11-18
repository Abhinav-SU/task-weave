import { Card } from '@/components/ui/card';
import { MessageSquare, GitBranch, Zap, Merge } from 'lucide-react';

const nodeTypes = [
  {
    type: 'ai-platform',
    icon: MessageSquare,
    label: 'AI Platform',
    color: 'text-green-500',
    description: 'Connect to AI models'
  },
  {
    type: 'condition',
    icon: GitBranch,
    label: 'Condition',
    color: 'text-yellow-500',
    description: 'Branch logic'
  },
  {
    type: 'transform',
    icon: Zap,
    label: 'Transform',
    color: 'text-cyan-500',
    description: 'Modify context'
  },
  {
    type: 'merge',
    icon: Merge,
    label: 'Merge',
    color: 'text-violet-500',
    description: 'Combine branches'
  },
];

export const NodePalette = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="p-4">
      <h3 className="font-bold mb-4">Node Palette</h3>
      <div className="space-y-2">
        {nodeTypes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-all"
            >
              <Icon className={`w-5 h-5 ${node.color}`} />
              <div className="flex-1">
                <div className="font-medium text-sm">{node.label}</div>
                <div className="text-xs text-muted-foreground">
                  {node.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
