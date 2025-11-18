import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Target, Clock } from "lucide-react";

const insightIcons = {
  trend: TrendingUp,
  tip: Lightbulb,
  goal: Target,
  time: Clock,
};

interface InsightCardProps {
  type: keyof typeof insightIcons;
  title: string;
  description: string;
  action?: string;
}

export const InsightCard = ({ type, title, description, action }: InsightCardProps) => {
  const Icon = insightIcons[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
            {action && (
              <button className="text-sm text-primary hover:underline">
                {action}
              </button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
