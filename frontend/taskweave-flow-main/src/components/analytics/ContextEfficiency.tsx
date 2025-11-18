import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { task: 'Research', original: 4500, compressed: 1200 },
  { task: 'Coding', original: 3200, compressed: 1100 },
  { task: 'Writing', original: 5000, compressed: 1500 },
  { task: 'Review', original: 2800, compressed: 900 },
  { task: 'Planning', original: 3500, compressed: 1000 },
];

export const ContextEfficiency = () => {
  const totalOriginal = data.reduce((acc, d) => acc + d.original, 0);
  const totalCompressed = data.reduce((acc, d) => acc + d.compressed, 0);
  const compressionRatio = Math.round((1 - totalCompressed / totalOriginal) * 100);
  const tokensPerDollar = 1000; // GPT-4 pricing approximation
  const savedCost = Math.round(((totalOriginal - totalCompressed) / tokensPerDollar) * 100) / 100;

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-2">Context Efficiency</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Original vs compressed context size
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="task" stroke="hsl(var(--foreground))" />
          <YAxis stroke="hsl(var(--foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="original" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} />
          <Bar dataKey="compressed" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Avg Compression</p>
          <p className="text-2xl font-bold">{compressionRatio}%</p>
        </div>
        
        <div className="p-4 bg-success/10 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Tokens Saved</p>
          <p className="text-2xl font-bold text-success">
            {(totalOriginal - totalCompressed).toLocaleString()}
          </p>
        </div>
        
        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Cost Savings</p>
          <p className="text-2xl font-bold text-primary">${savedCost}</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <p className="text-sm font-semibold">💡 Projected Annual Savings</p>
        <p className="text-lg font-bold mt-1">${(savedCost * 52).toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Based on current usage patterns
        </p>
      </div>
    </Card>
  );
};
