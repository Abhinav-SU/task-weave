import { Card } from "@/components/ui/card";

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = ['9am', '12pm', '3pm', '6pm', '9pm'];

// Mock data: 0-10 tasks per hour
const heatmapData = [
  [2, 3, 5, 7, 4],  // Monday
  [3, 6, 8, 9, 5],  // Tuesday - Peak day
  [2, 4, 6, 5, 3],  // Wednesday
  [3, 5, 7, 8, 4],  // Thursday
  [2, 3, 4, 3, 2],  // Friday
  [1, 2, 1, 2, 1],  // Saturday
  [1, 1, 2, 1, 1],  // Sunday
];

const getColor = (value: number) => {
  if (value === 0) return 'bg-muted';
  if (value <= 2) return 'bg-primary/20';
  if (value <= 4) return 'bg-primary/40';
  if (value <= 6) return 'bg-primary/60';
  if (value <= 8) return 'bg-primary/80';
  return 'bg-primary';
};

export const ProductivityHeatmap = () => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-2">Productivity Heatmap</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Task activity by day and time
      </p>

      <div className="space-y-2">
        <div className="flex gap-2 mb-4">
          <div className="w-16" />
          {hours.map((hour) => (
            <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
              {hour}
            </div>
          ))}
        </div>

        {days.map((day, dayIndex) => (
          <div key={day} className="flex gap-2">
            <div className="w-16 text-sm font-medium flex items-center">{day}</div>
            {heatmapData[dayIndex].map((value, hourIndex) => (
              <div
                key={`${day}-${hourIndex}`}
                className={`flex-1 h-12 rounded ${getColor(value)} transition-all hover:scale-110 hover:shadow-lg cursor-pointer flex items-center justify-center`}
                title={`${day} ${hours[hourIndex]}: ${value} tasks`}
              >
                <span className="text-xs font-medium opacity-0 hover:opacity-100">
                  {value}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm font-semibold mb-2">Peak Productivity</p>
        <p className="text-sm text-muted-foreground">
          🔥 Tuesdays at 6pm - Average 9 tasks completed
        </p>
      </div>
    </Card>
  );
};
