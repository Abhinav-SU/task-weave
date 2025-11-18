import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Trophy, Trash2 } from "lucide-react";
import { useAnalyticsStore } from "@/store/analyticsStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export const GoalsTracker = () => {
  const { goals, addGoal, deleteGoal } = useAnalyticsStore();
  const [open, setOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target: 20,
    current: 0,
    period: 'monthly' as const,
  });

  const handleAddGoal = () => {
    if (newGoal.title.trim()) {
      addGoal(newGoal);
      setNewGoal({ title: '', target: 20, current: 0, period: 'monthly' });
      setOpen(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Goals & Milestones</h3>
          <p className="text-sm text-muted-foreground">Track your progress</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Complete 20 tasks"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Target</Label>
                <Input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Period</Label>
                <Select
                  value={newGoal.period}
                  onValueChange={(v) => setNewGoal({ ...newGoal, period: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          
          return (
            <div key={goal.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{goal.title}</h4>
                    {goal.achieved && (
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {goal.period} goal
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteGoal(goal.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{goal.current} / {goal.target}</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {goal.achieved && (
                <div className="mt-3 text-sm text-success flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  Goal achieved! 🎉
                </div>
              )}
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No goals set yet</p>
            <p className="text-xs mt-1">Click "Add Goal" to create your first goal</p>
          </div>
        )}
      </div>
    </Card>
  );
};
