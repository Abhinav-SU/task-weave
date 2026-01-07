import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is TaskWeave?",
    answer: "TaskWeave is an AI workflow orchestration platform that lets you chain multiple LLM models together. Create visual workflows where each step uses the best AI model for that specific task."
  },
  {
    question: "Which AI models are supported?",
    answer: "We currently support OpenAI GPT-4 and Google Gemini 2.5 Flash, with more providers coming soon. Each model has different strengths - use them strategically in your workflows."
  },
  {
    question: "How do workflows work?",
    answer: "Create a workflow by adding AI nodes and connecting them. Each node calls an AI model with a specific prompt. Outputs from one node can be passed as inputs to the next, creating powerful multi-step AI automations."
  },
  {
    question: "Can I use it for free?",
    answer: "Yes! TaskWeave is currently free to use. You'll need your own API keys for the AI providers you want to use (OpenAI, Google, etc.)."
  },
  {
    question: "What are templates?",
    answer: "Templates are pre-built workflows for common tasks like code review, research analysis, and documentation generation. Start with a template and customize it for your needs."
  },
  {
    question: "Do I need API keys?",
    answer: "Yes. You'll need API keys from the AI providers you want to use. Configure them in Settings. This gives you full control and direct access to the models."
  },
  {
    question: "Can I save and reuse workflows?",
    answer: "Yes! Create custom workflows, save them as templates, and reuse them whenever needed. Share successful workflows across your projects."
  },
  {
    question: "How do I get started?",
    answer: "Sign up for an account, add your API keys in Settings, then browse the template gallery. Try running a template like 'Code Review' or 'Business Intelligence Research' to see workflows in action."
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
