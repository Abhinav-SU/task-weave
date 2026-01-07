import { motion } from "framer-motion";
import { Workflow, Zap, GitBranch, Grid3x3, FileStack, Play } from "lucide-react";

const features = [
  {
    icon: Workflow,
    title: "Visual Workflow Builder",
    description: "Drag-and-drop nodes to create AI workflows. Connect multiple models in sequence to solve complex problems."
  },
  {
    icon: Zap,
    title: "Multi-LLM Chaining",
    description: "Chain different AI models together. Use GPT-4 for research → Gemini for analysis → GPT-4 for formatting."
  },
  {
    icon: GitBranch,
    title: "Variable Interpolation",
    description: "Pass outputs between workflow nodes seamlessly. Each AI step builds on the previous results."
  },
  {
    icon: Grid3x3,
    title: "Multiple AI Providers",
    description: "Works with OpenAI GPT-4, Google Gemini, and more. Choose the best model for each task."
  },
  {
    icon: FileStack,
    title: "Template Library",
    description: "Pre-built workflow templates for common tasks. Start productive immediately with proven patterns."
  },
  {
    icon: Play,
    title: "Real-time Execution",
    description: "Watch your workflows execute step-by-step. See results and track progress in real-time with live updates."
  }
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const Icon = feature.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      className="p-8 rounded-2xl glass border border-border hover:border-primary/50 transition-all shadow-card hover:shadow-glow group"
    >
      <motion.div 
        className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mb-6 shadow-glow"
        whileHover={{ rotate: 5 }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
    </motion.div>
  );
};

export const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need to stay in flow
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            TaskWeave brings powerful features that make working with multiple AI tools effortless
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
