import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OverviewCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  description?: string;
  onClick?: () => void;
}

export const OverviewCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  description,
  onClick 
}: OverviewCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : ""}
    >
      <Card className="p-6 hover:shadow-glow transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold">{value}</p>
          
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </Card>
    </motion.div>
  );
};
