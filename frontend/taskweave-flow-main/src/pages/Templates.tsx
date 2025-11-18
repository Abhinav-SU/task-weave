import { motion } from "framer-motion";
import { Code, FileText, Search as SearchIcon, Lightbulb, Play, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTemplateStore } from "@/store/templateStore";

const legacyTemplates = [
  {
    id: '1',
    title: 'Code Review Assistant',
    description: 'Get comprehensive code reviews across multiple AI platforms',
    category: 'Development',
    icon: Code,
    platforms: ['chatgpt', 'claude'],
  },
  {
    id: '2',
    title: 'Research Paper Summary',
    description: 'Summarize and analyze research papers with different AI perspectives',
    category: 'Research',
    icon: FileText,
    platforms: ['claude', 'gemini'],
  },
  {
    id: '3',
    title: 'Content Ideation',
    description: 'Generate and refine content ideas across AI platforms',
    category: 'Writing',
    icon: Lightbulb,
    platforms: ['chatgpt', 'gemini'],
  },
  {
    id: '4',
    title: 'Bug Investigation',
    description: 'Debug issues by leveraging multiple AI debugging strategies',
    category: 'Development',
    icon: SearchIcon,
    platforms: ['chatgpt', 'claude', 'gemini'],
  },
];

const categories = ['All', 'Development', 'Research', 'Writing', 'General'];

export default function Templates() {
  const navigate = useNavigate();
  const { templates } = useTemplateStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Task Templates</h1>
            <p className="text-muted-foreground">
              Start with proven workflows and customize them to your needs
            </p>
          </div>
          <Button
            className="gradient-primary text-white gap-2"
            onClick={() => navigate('/dashboard/templates/builder')}
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>

        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === 'All' ? 'default' : 'outline'}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Your Templates</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-glow transition-all">
                  <div className="text-4xl mb-4">{template.icon}</div>
                  
                  <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary">{template.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      ~{template.estimatedTime}min
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => navigate(`/dashboard/templates/builder/${template.id}`)}
                    >
                      <Play className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      Use
                    </Button>
                  </div>

                  <div className="flex gap-1 mt-3 flex-wrap">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Example Templates</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {legacyTemplates.map((template, index) => {
              const Icon = template.icon;
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-glow transition-all">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{template.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{template.category}</Badge>
                      <Button size="sm" className="gap-2">
                        <Play className="w-3 h-3" />
                        Use Template
                      </Button>
                    </div>

                    <div className="flex gap-1 mt-4">
                      {template.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        <Card className="p-8 text-center gradient-card">
          <h2 className="text-2xl font-bold mb-2">Community Templates</h2>
          <p className="text-muted-foreground mb-6">
            Explore templates created by the TaskWeave community
          </p>
          <Button variant="outline" size="lg">
            Browse Community Templates
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
