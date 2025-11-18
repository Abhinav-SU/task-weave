import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does TaskWeave work?",
    answer: "TaskWeave is a browser extension that captures and syncs your AI conversations across platforms. When you switch from ChatGPT to Claude, it automatically transfers the relevant context, maintaining continuity."
  },
  {
    question: "Which AI platforms are supported?",
    answer: "We support ChatGPT, Claude, Gemini, Perplexity, Poe, HuggingChat, and more. New platforms are added regularly based on user requests."
  },
  {
    question: "Is my conversation data secure?",
    answer: "Absolutely. All data is encrypted end-to-end and stored securely. We never train models on your data or share it with third parties. You maintain full control over your conversations."
  },
  {
    question: "Can I use it for free?",
    answer: "Yes! Our free plan includes 10 tasks per month across 2 AI platforms. It's perfect for trying out TaskWeave and light usage. Upgrade to Pro for unlimited tasks and advanced features."
  },
  {
    question: "How does context compression work?",
    answer: "Our smart compression algorithm analyzes your conversation and removes redundant information while preserving meaning. This reduces token usage by up to 75% without losing important context."
  },
  {
    question: "Can I share tasks with my team?",
    answer: "Yes! Team plan users can share tasks, templates, and insights. Set permissions, collaborate on complex workflows, and maintain team knowledge bases."
  },
  {
    question: "Does it work on mobile?",
    answer: "Currently, TaskWeave is available as a browser extension for Chrome, Firefox, and Edge on desktop. Mobile support is on our roadmap and coming soon."
  },
  {
    question: "How do I install the extension?",
    answer: "Click 'Install Extension' and you'll be directed to the Chrome Web Store (or your browser's extension store). Install it, sign up for an account, and you're ready to go in under 2 minutes."
  }
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-24 relative">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about TaskWeave
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-xl px-6 bg-card hover:border-primary/50 transition-colors"
              >
                <AccordionTrigger className="text-left text-lg font-semibold py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
