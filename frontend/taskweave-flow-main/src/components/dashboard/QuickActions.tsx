import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Upload, Grid3x3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CreateTaskModal } from "./CreateTaskModal";

export const QuickActions = () => {
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const actions = [
    {
      icon: Plus,
      label: "New Task",
      color: "from-purple-500 to-purple-600",
      onClick: () => setCreateModalOpen(true)
    },
    {
      icon: Upload,
      label: "Import",
      color: "from-blue-500 to-blue-600",
      onClick: () => {
        // TODO: Open import modal
      }
    },
    {
      icon: Grid3x3,
      label: "Templates",
      color: "from-green-500 to-green-600",
      onClick: () => navigate('/dashboard/templates')
    }
  ];
  
  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className={`flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl transition-shadow`}
              >
                <Icon className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </Card>
      
      <CreateTaskModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </>
  );
};
