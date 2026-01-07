import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid, List, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { useTaskStore, TaskStatus } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AllTasks() {
  const { tasks, viewMode, setViewMode, fetchTasks, isLoading } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  
  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Tasks</h1>
            <p className="text-muted-foreground">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-9 w-9"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-9 w-9"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "all")}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2 whitespace-nowrap">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">More Filters</span>
            <span className="sm:hidden">Filters</span>
          </Button>
        </div>

        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filteredTasks.map((task, index) => (
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

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks found matching your criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
