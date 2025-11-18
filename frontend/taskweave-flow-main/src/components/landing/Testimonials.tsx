import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Research Scientist",
    company: "Stanford",
    content: "TaskWeave saved me hours by letting me continue research across AI platforms. The context compression is brilliant - I can maintain complex research threads without token bloat.",
    rating: 5,
    avatar: "SC"
  },
  {
    name: "Marcus Rodriguez",
    role: "Full-Stack Developer",
    company: "Tech Startup",
    content: "Game-changer for development workflows. No more copy-pasting context! I start in ChatGPT for architecture, move to Claude for code, and back to GPT for docs. Seamless.",
    rating: 5,
    avatar: "MR"
  },
  {
    name: "Emily Park",
    role: "Technical Writer",
    company: "SaaS Company",
    content: "The version control feature is brilliant. Like Git for AI conversations. I can branch off to try different approaches and merge the best results. Absolute game-changer.",
    rating: 5,
    avatar: "EP"
  }
];

const TestimonialCard = ({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="relative bg-card rounded-2xl p-8 border border-border shadow-card hover:shadow-glow transition-all group"
    >
      <Quote className="absolute top-6 left-6 w-12 h-12 text-primary/10" />
      
      <div className="relative z-10">
        <div className="flex gap-1 mb-6">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        
        <p className="text-lg mb-8 leading-relaxed italic">{testimonial.content}</p>
        
        <div className="flex items-center gap-4 pt-6 border-t border-border">
          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {testimonial.avatar}
          </div>
          <div>
            <div className="font-bold text-lg">{testimonial.name}</div>
            <div className="text-sm text-muted-foreground">
              {testimonial.role} @ {testimonial.company}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Testimonials = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-card opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Loved by professionals worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of users who have transformed their AI workflow with TaskWeave
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
