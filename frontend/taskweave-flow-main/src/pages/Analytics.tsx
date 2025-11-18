import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useTaskStore } from "@/store/taskStore";
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Analytics() {
  const tasks = useTaskStore((state) => state.tasks);

  const statusData = [
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length },
    { name: 'Archived', value: tasks.filter(t => t.status === 'archived').length },
  ];

  const platformData = [
    { name: 'ChatGPT', value: tasks.filter(t => t.platforms.includes('chatgpt')).length },
    { name: 'Claude', value: tasks.filter(t => t.platforms.includes('claude')).length },
    { name: 'Gemini', value: tasks.filter(t => t.platforms.includes('gemini')).length },
  ];

  const completionTrend = [
    { date: 'Mon', tasks: 3 },
    { date: 'Tue', tasks: 5 },
    { date: 'Wed', tasks: 4 },
    { date: 'Thu', tasks: 7 },
    { date: 'Fri', tasks: 6 },
    { date: 'Sat', tasks: 4 },
    { date: 'Sun', tasks: 5 },
  ];

  const COLORS = ['hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--muted))'];

  const avgContextSize = Math.round(tasks.reduce((acc, t) => acc + t.contextSize, 0) / tasks.length);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-muted-foreground">
              Insights into your TaskWeave usage and productivity
            </p>
          </div>
          
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
            <p className="text-3xl font-bold">{tasks.length}</p>
          </Card>
          
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Avg Context Size</p>
            <p className="text-3xl font-bold">{avgContextSize} KB</p>
          </Card>
          
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
            <p className="text-3xl font-bold">
              {Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%
            </p>
          </Card>
          
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Active Tasks</p>
            <p className="text-3xl font-bold">
              {tasks.filter(t => t.status === 'in-progress').length}
            </p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Task Completion Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={completionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Platform Usage</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Task Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
