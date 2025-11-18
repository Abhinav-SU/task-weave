import { motion } from "framer-motion";
import { Download, Link2, Rocket, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Download,
    title: "Install Extension",
    description: "Add TaskWeave to your browser in seconds. Works with Chrome, Firefox, and Edge.",
    image: "📥"
  },
  {
    icon: Link2,
    title: "Connect AI Tools",
    description: "Link your favorite AI platforms. We support ChatGPT, Claude, Gemini, and more.",
    image: "🔗"
  },
  {
    icon: Rocket,
    title: "Start Working",
    description: "Begin your task anywhere and seamlessly continue it on any connected platform.",
    image: "🚀"
  }
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-card opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get started in 3 simple steps
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            No complex setup. No configuration headaches. Just install and go.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Vertical timeline connector */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-success -translate-x-1/2" />
          
          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className={`relative flex items-center gap-8 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  {/* Content Card */}
                  <div className="flex-1 bg-card rounded-2xl p-8 shadow-card border border-border hover:border-primary/50 transition-all hover:shadow-glow">
                    <div className={`flex items-start gap-6 ${isEven ? '' : 'lg:flex-row-reverse lg:text-right'}`}>
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow text-4xl">
                          {step.image}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-3">
                          STEP {index + 1}
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Circle Badge */}
                  <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                      className="w-16 h-16 rounded-full bg-background border-4 border-primary shadow-glow flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </motion.div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden lg:block flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
