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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useState } from 'react';
import { TemplateMetadata } from '@/store/templateStore';

interface TemplateMetadataEditorProps {
  metadata: Partial<TemplateMetadata>;
  onChange: (metadata: Partial<TemplateMetadata>) => void;
}

const categories = ['Research', 'Development', 'Writing', 'Marketing', 'General'];
const iconOptions = ['📚', '💻', '✍️', '📊', '🎯', '🔬', '🎨', '💡', '🚀', '⚡'];

export const TemplateMetadataEditor = ({ metadata, onChange }: TemplateMetadataEditorProps) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !metadata.tags?.includes(tagInput.trim())) {
      onChange({
        ...metadata,
        tags: [...(metadata.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange({
      ...metadata,
      tags: metadata.tags?.filter((t) => t !== tag) || [],
    });
  };

  return (
    <Card className="p-6">
      <h3 className="font-bold mb-4">Template Details</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Template Name</Label>
          <Input
            value={metadata.name || ''}
            onChange={(e) => onChange({ ...metadata, name: e.target.value })}
            placeholder="My Awesome Template"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={metadata.description || ''}
            onChange={(e) => onChange({ ...metadata, description: e.target.value })}
            placeholder="Describe what this template does..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={metadata.category || 'General'}
              onValueChange={(v) => onChange({ ...metadata, category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <Select
              value={metadata.icon || '📚'}
              onValueChange={(v) => onChange({ ...metadata, icon: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    <span className="text-2xl">{icon}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Add tag..."
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {metadata.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Estimated Time (minutes)</Label>
          <Input
            type="number"
            value={metadata.estimatedTime || 30}
            onChange={(e) => onChange({ ...metadata, estimatedTime: parseInt(e.target.value) })}
            min={1}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="public">Public Template</Label>
          <Switch
            id="public"
            checked={metadata.isPublic || false}
            onCheckedChange={(checked) => onChange({ ...metadata, isPublic: checked })}
          />
        </div>
      </div>
    </Card>
  );
};
