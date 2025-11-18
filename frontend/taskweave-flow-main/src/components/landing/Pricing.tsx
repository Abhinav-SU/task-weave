import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out TaskWeave",
    features: [
      "10 tasks per month",
      "2 AI platforms",
      "Basic templates",
      "Community support",
      { text: "Advanced compression", muted: true },
      { text: "Custom templates", muted: true },
      { text: "Analytics dashboard", muted: true },
      { text: "Priority support", muted: true }
    ],
    cta: "Get Started",
    popular: false,
    variant: "outline" as const
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For professionals who rely on AI",
    features: [
      "Unlimited tasks",
      "10+ AI platforms",
      "Advanced compression",
      "Priority support",
      "Custom templates",
      "Analytics dashboard",
      "Version control",
      "Export & share"
    ],
    cta: "Start Free Trial",
    popular: true,
    variant: "default" as const
  },
  {
    name: "Team",
    price: "$29",
    period: "/month per user",
    description: "For teams working together",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Shared templates",
      "Admin controls",
      "SSO (coming soon)",
      "Dedicated support",
      "Custom integrations",
      "Advanced analytics"
    ],
    cta: "Contact Sales",
    popular: false,
    variant: "secondary" as const
  }
];

const PricingCard = ({ plan, index }: { plan: typeof plans[0]; index: number }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
      className={`relative p-8 rounded-2xl border bg-card shadow-card hover:shadow-glow transition-all ${
        plan.popular ? 'border-primary shadow-glow' : 'border-border'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1 rounded-full gradient-primary text-white text-sm font-bold shadow-lg">
            Most Popular
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold">{plan.price}</span>
          {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
        </div>
      </div>

      <Button 
        className={`w-full mb-6 ${plan.popular ? 'gradient-primary text-white shadow-glow animate-pulse' : ''}`}
        variant={plan.variant}
        size="lg"
        onClick={() => navigate('/dashboard')}
      >
        {plan.cta}
      </Button>

      <ul className="space-y-3">
        {plan.features.map((feature, i) => {
          const featureText = typeof feature === 'string' ? feature : feature.text;
          const isMuted = typeof feature === 'object' && feature.muted;
          
          return (
            <li key={i} className="flex items-start gap-3">
              <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isMuted ? 'text-muted-foreground/40' : 'text-success'}`} />
              <span className={isMuted ? 'text-muted-foreground line-through' : ''}>
                {featureText}
              </span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
            Choose the plan that works best for you
          </p>
          <div className="inline-block px-4 py-2 rounded-full bg-success/10 text-success text-sm font-semibold">
            💰 Save 20% with annual billing
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
