import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from "lucide-react";
import { useState } from "react";

const data = [
  { date: 'Mon', created: 12, completed: 8, archived: 2 },
  { date: 'Tue', created: 19, completed: 15, archived: 3 },
  { date: 'Wed', created: 15, completed: 12, archived: 4 },
  { date: 'Thu', created: 22, completed: 18, archived: 5 },
  { date: 'Fri', created: 18, completed: 14, archived: 3 },
  { date: 'Sat', created: 10, completed: 8, archived: 2 },
  { date: 'Sun', created: 8, completed: 6, archived: 1 },
];

export const TaskActivityChart = () => {
  const [activeLines, setActiveLines] = useState({
    created: true,
    completed: true,
    archived: false,
  });

  const handleExport = () => {
    const csv = [
      ['Date', 'Created', 'Completed', 'Archived'],
      ...data.map(row => [row.date, row.created, row.completed, row.archived])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task-activity.csv';
    a.click();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Task Activity</h3>
          <p className="text-sm text-muted-foreground">Tasks created, completed, and archived over time</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={activeLines.created ? 'default' : 'outline'}
          onClick={() => setActiveLines({ ...activeLines, created: !activeLines.created })}
        >
          Created
        </Button>
        <Button
          size="sm"
          variant={activeLines.completed ? 'default' : 'outline'}
          onClick={() => setActiveLines({ ...activeLines, completed: !activeLines.completed })}
        >
          Completed
        </Button>
        <Button
          size="sm"
          variant={activeLines.archived ? 'default' : 'outline'}
          onClick={() => setActiveLines({ ...activeLines, archived: !activeLines.archived })}
        >
          Archived
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
          {activeLines.created && (
            <Line
              type="monotone"
              dataKey="created"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          )}
          {activeLines.completed && (
            <Line
              type="monotone"
              dataKey="completed"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--success))' }}
            />
          )}
          {activeLines.archived && (
            <Line
              type="monotone"
              dataKey="archived"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--muted-foreground))' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
