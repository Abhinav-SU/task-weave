import { motion } from "framer-motion";
import { MoreVertical, Clock, Tag } from "lucide-react";
import { Task, AIPlatform, useTaskStore } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface TaskCardProps {
  task: Task;
}

const platformIcons: Record<AIPlatform, string> = {
  chatgpt: "💬",
  claude: "🤖",
  gemini: "✨",
};

const statusColors = {
  'in-progress': 'bg-secondary text-secondary-foreground',
  'completed': 'bg-success text-success-foreground',
  'archived': 'bg-muted text-muted-foreground',
};

const priorityColors = {
  'low': 'border-l-muted',
  'medium': 'border-l-secondary',
  'high': 'border-l-destructive',
};

export const TaskCard = ({ task }: TaskCardProps) => {
  const navigate = useNavigate();
  const { deleteTask, updateTask } = useTaskStore();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative"
    >
      <div
        className={`bg-card rounded-xl border-l-4 ${priorityColors[task.priority]} border-t border-r border-b border-border p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden`}
        onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
      >
        {/* Thumbnail/Preview Area */}
        <div className="relative h-24 -mx-5 -mt-5 mb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-3">
              {task.platforms.map((platform) => (
                <span key={platform} className="text-3xl opacity-40">
                  {platformIcons[platform]}
                </span>
              ))}
            </div>
          </div>
          
          {/* Platform badges */}
          <div className="absolute top-3 left-8 flex gap-2">
            {task.platforms.map((platform) => (
              <div key={platform} className="w-8 h-8 rounded-lg bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center shadow-sm">
                <span className="text-sm">{platformIcons[platform]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold line-clamp-1 flex-1">{task.title}</h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/tasks/${task.id}`);
                }}
              >
                Continue
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info('Branch feature coming soon!');
                }}
              >
                Create Branch
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await updateTask(task.id, { status: 'archived' });
                    toast.success('Task archived');
                  } catch (error) {
                    toast.error('Failed to archive task');
                  }
                }}
              >
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${task.title}"?`)) {
                    try {
                      await deleteTask(task.id);
                      toast.success('Task deleted');
                    } catch (error) {
                      toast.error('Failed to delete task');
                    }
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {task.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <Badge className={statusColors[task.status]}>
            {task.status.replace('-', ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {task.contextSize} KB
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(task.updatedAt).toLocaleDateString()}
            </span>
          </div>
          
          {task.tags.length > 0 && (
            <div className="flex gap-1">
              {task.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-[10px]">
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-[10px]">+{task.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Continue button - appears on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Button 
            className="w-full pointer-events-auto" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/tasks/${task.id}`);
            }}
          >
            Continue Task
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
