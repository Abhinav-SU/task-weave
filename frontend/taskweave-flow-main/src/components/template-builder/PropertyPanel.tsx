import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface PropertyPanelProps {
  selectedNode: Node | null;
  onUpdate: (nodeId: string, data: any) => void;
}

export const PropertyPanel = ({ selectedNode, onUpdate }: PropertyPanelProps) => {
  if (!selectedNode) {
    return (
      <Card className="p-6 h-full">
        <div className="text-center text-muted-foreground">
          Select a node to edit its properties
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

  const renderAIPlatformProperties = () => (
    <>
      <div className="space-y-2">
        <Label>Label</Label>
        <Input
          value={String(selectedNode.data.label || '')}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="Node label"
        />
      </div>

      <div className="space-y-2">
        <Label>AI Platform</Label>
        <Select
          value={String(selectedNode.data.platform || 'chatgpt')}
          onValueChange={(v) => handleChange('platform', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chatgpt">💬 ChatGPT</SelectItem>
            <SelectItem value="claude">🤖 Claude</SelectItem>
            <SelectItem value="gemini">✨ Gemini</SelectItem>
            <SelectItem value="perplexity">🔍 Perplexity</SelectItem>
            <SelectItem value="cursor">⚡ Cursor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Prompt Template</Label>
        <Textarea
          value={String(selectedNode.data.prompt || '')}
          onChange={(e) => handleChange('prompt', e.target.value)}
          placeholder="Enter prompt with {{variables}}"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Use {`{{variable_name}}`} for dynamic values
        </p>
      </div>

      <div className="space-y-2">
        <Label>Context Strategy</Label>
        <Select
          value={String(selectedNode.data.contextStrategy || 'full')}
          onValueChange={(v) => handleChange('contextStrategy', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Context</SelectItem>
            <SelectItem value="summarized">Summarized</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

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
        <Label>Condition</Label>
        <Input
          value={String(selectedNode.data.condition || '')}
          onChange={(e) => handleChange('condition', e.target.value)}
          placeholder="e.g., output_length > 500"
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
          </SelectContent>
        </Select>
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
          value={String(selectedNode.data.operation || 'compress')}
          onValueChange={(v) => handleChange('operation', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compress">Compress</SelectItem>
            <SelectItem value="expand">Expand</SelectItem>
            <SelectItem value="filter">Filter</SelectItem>
            <SelectItem value="rewrite">Rewrite</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedNode.data.operation === 'compress' && (
        <div className="space-y-2">
          <Label>Compression Ratio: {Math.round(Number(selectedNode.data.ratio || 0.5) * 100)}%</Label>
          <Slider
            value={[Number(selectedNode.data.ratio || 0.5) * 100]}
            onValueChange={(v) => handleChange('ratio', v[0] / 100)}
            max={100}
            step={5}
          />
        </div>
      )}
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

      <div className="text-sm text-muted-foreground">
        This node combines outputs from multiple branches.
      </div>
    </>
  );

  return (
    <Card className="p-6 h-full overflow-auto">
      <h3 className="font-bold mb-4">Node Properties</h3>
      
      <div className="space-y-4">
        {selectedNode.type === 'ai-platform' && renderAIPlatformProperties()}
        {selectedNode.type === 'condition' && renderConditionProperties()}
        {selectedNode.type === 'transform' && renderTransformProperties()}
        {selectedNode.type === 'merge' && renderMergeProperties()}

        <Separator />

        <div className="text-xs text-muted-foreground">
          Node ID: {selectedNode.id}
        </div>
      </div>
    </Card>
  );
};
