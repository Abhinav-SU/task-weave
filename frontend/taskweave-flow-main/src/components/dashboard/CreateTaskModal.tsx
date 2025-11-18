import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from './TagInput';
import { useTaskStore, Priority } from '@/store/taskStore';
import { toast } from 'sonner';

const createTaskSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .trim()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  tags: z.array(z.string()).default([]),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTaskModal = ({ open, onOpenChange }: CreateTaskModalProps) => {
  const addTask = useTaskStore((state) => state.addTask);
  
  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      priority: 'medium',
    }
  });
  
  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      addTask({
        title: data.title,
        description: data.description || '',
        status: 'in-progress',
        priority: data.priority as Priority,
        platforms: [],
        messages: [],
        branches: [],
        tags: data.tags,
        contextSize: 0,
      });
      
      toast.success('Task created successfully!', {
        description: 'You can now start working on your task',
      });
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to create task', {
        description: 'Please try again',
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Task Title *
            </label>
            <Input
              {...form.register('title')}
              placeholder="e.g., Research AI trends for blog post"
            />
            {form.formState.errors.title && (
              <p className="text-destructive text-sm mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <Textarea
              {...form.register('description')}
              rows={4}
              placeholder="What are you working on?"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.watch('description')?.length || 0} / 1000
            </p>
            {form.formState.errors.description && (
              <p className="text-destructive text-sm mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Priority
            </label>
            <Select
              value={form.watch('priority')}
              onValueChange={(value) => form.setValue('priority', value as Priority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Tags */}
          <TagInput
            value={form.watch('tags')}
            onChange={(tags) => form.setValue('tags', tags)}
          />
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
