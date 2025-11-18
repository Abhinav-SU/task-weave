import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Download, FileText, CheckCircle, Clock, Archive, Zap, Target } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { useTaskStore } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { CreateTaskModal } from "@/components/dashboard/CreateTaskModal";
import { useNavigate } from "react-router-dom";

export default function DashboardHome() {
  const tasks = useTaskStore((state) => state.tasks);
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const activeTasks = tasks.filter((t) => t.status === 'in-progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const thisMonthTasks = tasks.filter(t => {
    const taskDate = new Date(t.createdAt);
    const now = new Date();
    return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
  });
  
  const totalContextSaved = tasks.reduce((sum, t) => sum + t.contextSize, 0);
  const avgCompletionTime = tasks.length > 0 ? 2.4 : 0; // Mock calculation
  
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your tasks.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Import
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => navigate('/dashboard/templates')}
            >
              <FileText className="w-4 h-4" />
              Templates
            </Button>
            <Button 
              className="gradient-primary text-white gap-2"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <OverviewCard
            icon={Clock}
            label="Active Tasks"
            value={activeTasks.length}
            trend={12}
            description="Tasks in progress"
            onClick={() => navigate('/dashboard/tasks')}
          />
          
          <OverviewCard
            icon={Target}
            label="Completed This Month"
            value={thisMonthTasks.filter(t => t.status === 'completed').length}
            trend={8}
            description={`${thisMonthTasks.filter(t => t.status === 'completed').length}/50 monthly goal`}
          />
          
          <OverviewCard
            icon={Zap}
            label="Context Saved"
            value={`${(totalContextSaved / 1000).toFixed(1)}K`}
            description={`≈ $${(totalContextSaved * 0.00005).toFixed(2)} saved`}
          />
          
          <OverviewCard
            icon={CheckCircle}
            label="Avg. Completion"
            value={`${avgCompletionTime}d`}
            trend={-15}
            description="Faster than last month"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Tasks</h2>
              <Button variant="ghost" onClick={() => navigate('/dashboard/tasks')}>
                View All
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {recentTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TaskCard task={task} />
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <QuickActions />
            <ActivityTimeline tasks={tasks} />
          </div>
        </div>
      </div>
      
      <CreateTaskModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </DashboardLayout>
  );
}
