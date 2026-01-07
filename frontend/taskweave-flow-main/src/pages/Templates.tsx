import React from "react";
import { motion } from "framer-motion";
import { Code, FileText, Search as SearchIcon, Lightbulb, Play, Plus, Loader2, Filter, DollarSign, Info, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useTemplateStore } from "@/store/templateStore";
import { RunTemplateDialog } from "@/components/RunTemplateDialog";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const categories = ['All', 'Research', 'Development', 'Writing', 'Data', 'Analysis', 'Productivity', 'HR'];

// Category colors for visual distinction
const categoryColors: Record<string, string> = {
  'Development': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Research': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Writing': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'General': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Data': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Analysis': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Productivity': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'HR': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

// Cost tier colors
const costTierColors: Record<string, string> = {
  'low': 'text-green-600 bg-green-100 dark:bg-green-900/30',
  'medium': 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  'high': 'text-red-600 bg-red-100 dark:bg-red-900/30',
};

export default function Templates() {
  const navigate = useNavigate();
  const { templates, fetchTemplates, isLoading } = useTemplateStore();
  const { toast } = useToast();
  const [runDialogOpen, setRunDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Fetch templates on mount
  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Filter templates based on category and search
  const filteredTemplates = React.useMemo(() => {
    return templates.filter(template => {
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  // Group templates by category for display
  const templatesByCategory = React.useMemo(() => {
    const grouped: Record<string, typeof templates> = {};
    filteredTemplates.forEach(template => {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    });
    return grouped;
  }, [filteredTemplates]);

  const handleRunTemplate = (template: any) => {
    setSelectedTemplate(template);
    setRunDialogOpen(true);
  };

  const handleExecutionSuccess = (executionId: string, taskId: string) => {
    toast({
      title: "🚀 Workflow Started",
      description: "Redirecting to task page to see results...",
    });
    navigate(`/dashboard/tasks/${taskId}`);
  };

  // Template count by category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { 'All': templates.length };
    templates.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [templates]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Multi-LLM Workflow Templates</h1>
            <p className="text-muted-foreground">
              {templates.length} cost-optimized templates • Use the right LLM for each step
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

        {/* Cost Strategy Info Banner */}
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">Intelligent Multi-LLM Architecture</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Each template uses <strong>specialized models for specific tasks</strong>. Gemini handles bulk processing, GPT-4 handles structured analysis. 
                Optimized for both performance and efficiency.
              </p>
            </div>
          </div>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.filter(cat => categoryCounts[cat] > 0 || cat === 'All').map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="relative"
              >
                {category}
                {categoryCounts[category] > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({categoryCounts[category]})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading templates...</span>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : selectedCategory === 'All' ? (
          // Show by category when "All" is selected
          Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{category}</h2>
                <Badge variant="secondary" className={categoryColors[category]}>
                  {categoryTemplates.length} templates
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTemplates.map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    index={index}
                    onRun={() => handleRunTemplate(template)}
                    categoryColors={categoryColors}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Show flat list when specific category is selected
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
                onRun={() => handleRunTemplate(template)}
                categoryColors={categoryColors}
              />
            ))}
          </div>
        )}

        {/* Community Section */}
        <Card className="p-8 text-center gradient-card mt-8">
          <h2 className="text-2xl font-bold mb-2">Community Templates</h2>
          <p className="text-muted-foreground mb-6">
            Share your templates with the TaskWeave community (Coming Soon)
          </p>
          <Button variant="outline" size="lg" disabled>
            Browse Community Templates
          </Button>
        </Card>
      </div>

      {/* Run Template Dialog */}
      {selectedTemplate && (
        <RunTemplateDialog
          open={runDialogOpen}
          onOpenChange={setRunDialogOpen}
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.name}
          templateMetadata={{
            nodes: selectedTemplate.nodes,
            edges: selectedTemplate.edges,
            inputVariables: selectedTemplate.inputVariables,
          }}
          onSuccess={handleExecutionSuccess}
        />
      )}
    </DashboardLayout>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: any;
  index: number;
  onRun: () => void;
  categoryColors: Record<string, string>;
}

function TemplateCard({ template, index, onRun, categoryColors }: TemplateCardProps) {
  const navigate = useNavigate();
  
  // Count LLMs used in the template
  const llmCount = template.nodes?.filter((n: any) => n.type === 'aiNode').length || 0;
  const platforms = [...new Set(template.nodes?.map((n: any) => n.data?.platform).filter(Boolean) || [])];
  
  // Get LLM breakdown info
  const llmBreakdown = template.llmBreakdown || [];
  
  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.05, 0.3) }}
      >
        <Card className="p-5 hover:shadow-lg transition-all duration-200 h-full flex flex-col group border-2 hover:border-primary/20">
          {/* Icon and Category */}
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">{template.icon}</div>
            <Badge 
              variant="secondary" 
              className={`text-xs ${categoryColors[template.category] || ''}`}
            >
              {template.category}
            </Badge>
          </div>
          
          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
            {template.name}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow">
            {template.description}
          </p>

          {/* Cost & Performance Info */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {/* Cost Estimate */}
            {template.estimatedCost && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200">
                    <DollarSign className="w-3 h-3" />
                    {template.estimatedCost}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Cost Strategy:</p>
                  <p className="text-sm">{template.costStrategy}</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {/* Time Estimate */}
            <Badge variant="outline" className="text-xs gap-1">
              <Zap className="w-3 h-3" />
              ~{template.estimatedTime} min
            </Badge>
          </div>

          {/* LLM Breakdown */}
          {llmBreakdown.length > 0 && (
            <div className="mb-3 space-y-1.5">
              {llmBreakdown.map((llm: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${
                    llm.costTier === 'low' ? 'bg-green-500' :
                    llm.costTier === 'medium' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`} />
                  <span className="font-medium text-foreground">{llm.model}</span>
                  <span className="text-muted-foreground">→ {llm.role}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {template.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs py-0">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs py-0">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => navigate(`/dashboard/templates/builder/${template.id}`)}
            >
              <FileText className="w-3 h-3" />
              View
            </Button>
            <Button 
              size="sm" 
              className="flex-1 gap-1.5 gradient-primary text-white"
              onClick={onRun}
            >
              <Play className="w-3 h-3" />
              Run
            </Button>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}
