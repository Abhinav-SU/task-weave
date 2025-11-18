import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const comparisons = [
  { feature: "Context Preservation", without: false, with: true },
  { feature: "Cross-Platform Continuity", without: false, with: true },
  { feature: "Version Control", without: false, with: true },
  { feature: "Context Compression", without: false, with: true },
  { feature: "Template Workflows", without: false, with: true },
  { feature: "Team Collaboration", without: false, with: true },
  { feature: "Cost Savings", without: false, with: true },
  { feature: "Analytics", without: false, with: true },
];

export const Comparison = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why TaskWeave changes everything
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            See the difference TaskWeave makes in your AI workflow
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Without TaskWeave */}
            <div className="glass rounded-2xl p-8 backdrop-blur-xl border border-border">
              <h3 className="text-2xl font-bold mb-6 text-center">Without TaskWeave</h3>
              <ul className="space-y-4">
                {comparisons.map((comparison, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <X className="w-5 h-5 text-destructive flex-shrink-0" />
                    <span>{comparison.feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* With TaskWeave */}
            <div className="glass rounded-2xl p-8 backdrop-blur-xl border-2 border-primary shadow-glow">
              <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                With TaskWeave
              </h3>
              <ul className="space-y-4">
                {comparisons.map((comparison, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="font-medium">{comparison.feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
