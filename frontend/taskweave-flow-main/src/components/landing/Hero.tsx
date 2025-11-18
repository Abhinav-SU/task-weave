import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, Chrome, CheckCircle2, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FloatingBadge = ({ children, delay, position }: { children: React.ReactNode; delay: number; position: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: [0, -10, 0] }}
    transition={{ 
      opacity: { delay, duration: 0.5 },
      y: { delay: delay + 0.5, duration: 3, repeat: Infinity, ease: "easeInOut" }
    }}
    className={`absolute glass px-6 py-3 rounded-2xl text-sm font-medium shadow-lg ${position}`}
  >
    {children}
  </motion.div>
);

const PlatformCard = ({ name, color, delay }: { name: string; color: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`glass p-4 rounded-xl ${color} backdrop-blur-xl`}
  >
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-current" />
      <span className="font-semibold">{name}</span>
    </div>
    <p className="text-xs mt-2 opacity-75">Processing task...</p>
  </motion.div>
);

export const Hero = () => {
  const [typedText, setTypedText] = useState("");
  const fullText = "TaskWeave lets you continue conversations seamlessly across ChatGPT, Claude, Gemini, and more";
  const navigate = useNavigate();

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 gradient-hero opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-[60%_40%] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Never Lose Your{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI Conversations
              </span>{" "}
              Again
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed"
            >
              {typedText}
              <span className="animate-pulse">|</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <Button 
                size="lg" 
                className="gradient-primary text-white shadow-glow group text-base px-8"
                onClick={() => navigate('/dashboard')}
              >
                <Chrome className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Install Extension
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base px-8 border-2 border-primary text-primary hover:bg-primary/5">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex items-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>10,000+ Users</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[400px] lg:h-[500px]"
          >
            <div className="relative">
              <PlatformCard name="ChatGPT" color="text-[#10A37F]" delay={0.4} />
              
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass px-4 py-2 rounded-full text-xs font-medium"
              >
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 animate-pulse" />
                  <span>4.2K → 1.1K tokens</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mt-20"
              >
                <PlatformCard name="Claude" color="text-[#CC785C]" delay={1} />
              </motion.div>

              <div className="flex gap-4 mt-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  className="flex-1"
                >
                  <PlatformCard name="Gemini" color="text-[#4285F4]" delay={1.3} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="flex-1"
                >
                  <PlatformCard name="ChatGPT" color="text-[#10A37F]" delay={1.5} />
                </motion.div>
              </div>
            </div>

            <FloatingBadge delay={1.8} position="bottom-4 left-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#10A37F] flex items-center justify-center text-xs text-white">C</div>
                <span>ChatGPT</span>
              </div>
            </FloatingBadge>
            <FloatingBadge delay={2} position="bottom-4 right-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#CC785C] flex items-center justify-center text-xs text-white">C</div>
                <span>Claude</span>
              </div>
            </FloatingBadge>
            <FloatingBadge delay={2.2} position="bottom-20 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#4285F4] flex items-center justify-center text-xs text-white">G</div>
                <span>Gemini</span>
              </div>
            </FloatingBadge>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
