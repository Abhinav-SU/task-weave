import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MetricCard } from "@/components/analytics/MetricCard";
import { InsightCard } from "@/components/analytics/InsightCard";
import { TaskActivityChart } from "@/components/analytics/TaskActivityChart";
import { CompletionFunnel } from "@/components/analytics/CompletionFunnel";
import { ProductivityHeatmap } from "@/components/analytics/ProductivityHeatmap";
import { GoalsTracker } from "@/components/analytics/GoalsTracker";
import { ContextEfficiency } from "@/components/analytics/ContextEfficiency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTaskStore } from "@/store/taskStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import {
  CheckSquare,
  Clock,
  TrendingUp,
  Zap,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AnalyticsDashboard() {
  const tasks = useTaskStore((state) => state.tasks);
  const { dateRange, setDateRange } = useAnalyticsStore();

  const platformData = [
    { name: 'ChatGPT', value: tasks.filter(t => t.platforms.includes('chatgpt')).length, color: 'hsl(var(--primary))' },
    { name: 'Claude', value: tasks.filter(t => t.platforms.includes('claude')).length, color: 'hsl(var(--secondary))' },
    { name: 'Gemini', value: tasks.filter(t => t.platforms.includes('gemini')).length, color: 'hsl(var(--accent))' },
  ];

  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(t => t.status === 'in-progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const avgContextSize = Math.round(tasks.reduce((acc, t) => acc + t.contextSize, 0) / (tasks.length || 1));
  const mostUsedPlatform = platformData.length > 0 
    ? platformData.reduce((max, p) => p.value > max.value ? p : max).name 
    : 'None';

  // Compute real insights from task data
  const insights = [];
  
  // Platform usage insight
  if (platformData.length > 0) {
    const topPlatform = platformData.reduce((max, p) => p.value > max.value ? p : max);
    if (topPlatform.value > 0) {
      insights.push({
        type: 'trend' as const,
        title: `${topPlatform.name} is your Go-To`,
        description: `You've used ${topPlatform.name} for ${topPlatform.value} tasks (${Math.round((topPlatform.value / totalTasks) * 100)}% of all tasks).`,
        action: 'View tasks →'
      });
    }
  }
  
  // Completion rate insight
  if (totalTasks > 0) {
    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    insights.push({
      type: 'tip' as const,
      title: completionRate > 50 ? 'Great Completion Rate!' : 'Room for Improvement',
      description: `You've completed ${completedTasks} out of ${totalTasks} tasks (${completionRate}% completion rate). ${completionRate > 50 ? 'Keep up the great work!' : 'Focus on finishing active tasks.'}`,
      action: 'View completed tasks →'
    });
  }
  
  // Active tasks insight
  if (activeTasks > 5) {
    insights.push({
      type: 'time' as const,
      title: 'Many Active Tasks',
      description: `You have ${activeTasks} tasks in progress. Consider focusing on completing a few before starting new ones.`,
    });
  }
  
  // Monthly goal insight
  const now = new Date();
  const thisMonthTasks = tasks.filter(t => {
    const taskDate = new Date(t.createdAt);
    return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
  });
  
  if (thisMonthTasks.length > 0) {
    insights.push({
      type: 'goal' as const,
      title: 'This Month',
      description: `You've created ${thisMonthTasks.length} tasks this month. Keep building momentum!`,
      action: 'View this month →'
    });
  }

  const handleExportReport = () => {
    const reportData = {
      generated: new Date().toISOString(),
      totalTasks,
      activeTasks,
      avgContextSize,
      mostUsedPlatform,
      tasks: tasks.map(t => ({
        title: t.title,
        status: t.status,
        platforms: t.platforms,
        createdAt: t.createdAt,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskweave-analytics-${Date.now()}.json`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your TaskWeave usage
            </p>
          </div>

          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="quarter">Last 3 months</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="default" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>

            <Button size="default" className="gap-2" onClick={handleExportReport}>
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total Tasks"
            value={totalTasks}
            trend={15}
            icon={CheckSquare}
            description="All time"
          />
          <MetricCard
            title="Active Tasks"
            value={activeTasks}
            trend={-5}
            icon={TrendingUp}
            description="In progress"
          />
          <MetricCard
            title="Context Saved"
            value={`${avgContextSize}K`}
            trend={22}
            icon={Zap}
            description="Avg tokens"
          />
          <MetricCard
            title="Avg Completion"
            value="2.5h"
            trend={0}
            icon={Clock}
            description="Per task"
          />
          <MetricCard
            title="Top Platform"
            value={mostUsedPlatform}
            icon={Zap}
            description="Most used"
          />
        </div>

        {/* AI Insights */}
        <div>
          <h2 className="text-xl font-bold mb-4">AI-Powered Insights</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <InsightCard key={index} {...insight} />
            ))}
          </div>
        </div>

        {/* Main Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TaskActivityChart />
          </div>
          
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Platform Usage</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name} (${entry.value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {platformData.map((platform) => {
                const percentage = Math.round((platform.value / totalTasks) * 100);
                return (
                  <div key={platform.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: platform.color }}
                      />
                      <span>{platform.name}</span>
                    </div>
                    <span className="font-medium">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Secondary Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <CompletionFunnel />
          <ContextEfficiency />
        </div>

        {/* Productivity & Goals */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProductivityHeatmap />
          </div>
          <GoalsTracker />
        </div>
      </div>
    </DashboardLayout>
  );
}
