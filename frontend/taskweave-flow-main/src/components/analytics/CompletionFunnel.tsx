import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const funnelData = [
  { stage: 'Tasks Started', count: 1000, color: 'bg-primary' },
  { stage: 'Multiple Platforms', count: 750, color: 'bg-secondary' },
  { stage: 'With Branches', count: 500, color: 'bg-accent' },
  { stage: 'Completed', count: 350, color: 'bg-success' },
];

export const CompletionFunnel = () => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-2">Task Completion Funnel</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Conversion rates through workflow stages
      </p>

      <div className="space-y-4">
        {funnelData.map((stage, index) => {
          const percentage = Math.round((stage.count / funnelData[0].count) * 100);
          const width = percentage;
          const conversionRate = index > 0
            ? Math.round((stage.count / funnelData[index - 1].count) * 100)
            : 100;

          return (
            <div key={stage.stage}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{stage.stage}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {stage.count} tasks
                  </span>
                  {index > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {conversionRate}% conversion
                    </span>
                  )}
                </div>
              </div>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`h-12 ${stage.color} rounded-lg flex items-center justify-center relative overflow-hidden`}
                style={{ maxWidth: '100%' }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
                <span className="text-white font-bold relative z-10">
                  {percentage}%
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm">
          <span className="font-semibold">Overall Completion Rate:</span>{' '}
          {Math.round((funnelData[3].count / funnelData[0].count) * 100)}%
        </p>
      </div>
    </Card>
  );
};
