import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Task } from "@/store/taskStore";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, GitBranch, RefreshCw, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActivityTimelineProps {
  tasks: Task[];
}

export const ActivityTimeline = ({ tasks }: ActivityTimelineProps) => {
  const navigate = useNavigate();
  
  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in-progress':
        return RefreshCw;
      case 'archived':
        return Archive;
      default:
        return GitBranch;
    }
  };
  
  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'in-progress':
        return 'bg-secondary';
      case 'archived':
        return 'bg-muted';
      default:
        return 'bg-primary';
    }
  };
  
  const recentActivity = tasks
    .slice(0, 5)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {recentActivity.map((task, index) => {
          const Icon = getActivityIcon(task.status);
          const colorClass = getActivityColor(task.status);
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
              className="flex gap-4 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
            >
              <div className="relative">
                <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                {index < recentActivity.length - 1 && (
                  <div className="absolute top-8 left-1/2 w-0.5 h-6 bg-border -translate-x-1/2" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{task.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {task.status === 'completed' ? 'Completed' : 'Updated'} {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                </p>
                <div className="flex gap-1 mt-2">
                  {task.platforms.map(platform => (
                    <span key={platform} className="text-xs px-2 py-0.5 rounded-full bg-muted">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};
