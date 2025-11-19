import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node, Edge } from '@xyflow/react';
import { api } from '@/lib/api';

export type NodeType = 'ai-platform' | 'condition' | 'transform' | 'merge';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: string;
  isPublic: boolean;
  estimatedTime: number;
  author?: string;
  ratings?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowTemplate extends TemplateMetadata {
  nodes: Node[];
  edges: Edge[];
}

interface TemplateStore {
  templates: WorkflowTemplate[];
  currentTemplate: WorkflowTemplate | null;
  isLoading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  setCurrentTemplate: (template: WorkflowTemplate | null) => void;
  updateCurrentTemplate: (updates: Partial<WorkflowTemplate>) => void;
  saveTemplate: (template: WorkflowTemplate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplateById: (id: string) => WorkflowTemplate | undefined;
  duplicateTemplate: (id: string) => Promise<void>;
}

const exampleTemplates: WorkflowTemplate[] = [
  {
    id: 'research-assistant',
    name: 'Research Paper Assistant',
    description: 'Complete research workflow from topic research to final polished paper',
    category: 'Research',
    tags: ['research', 'writing', 'academic'],
    icon: '📚',
    isPublic: true,
    estimatedTime: 45,
    ratings: 4.8,
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: [
      {
        id: '1',
        type: 'ai-platform',
        position: { x: 100, y: 100 },
        data: { 
          platform: 'perplexity',
          label: 'Research Topic',
          prompt: 'Research the following topic: {{topic}}',
          contextStrategy: 'full'
        },
      },
      {
        id: '2',
        type: 'ai-platform',
        position: { x: 100, y: 250 },
        data: { 
          platform: 'chatgpt',
          label: 'Organize Findings',
          prompt: 'Organize these research findings into a structured outline',
          contextStrategy: 'summarized'
        },
      },
      {
        id: '3',
        type: 'ai-platform',
        position: { x: 100, y: 400 },
        data: { 
          platform: 'claude',
          label: 'Write Draft',
          prompt: 'Write a comprehensive draft based on this outline',
          contextStrategy: 'full'
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
  },
  {
    id: 'content-pipeline',
    name: 'Content Creation Pipeline',
    description: 'Generate, refine, and optimize content with quality checks',
    category: 'Writing',
    tags: ['content', 'seo', 'marketing'],
    icon: '✍️',
    isPublic: true,
    estimatedTime: 30,
    ratings: 4.6,
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: [
      {
        id: '1',
        type: 'ai-platform',
        position: { x: 100, y: 100 },
        data: { 
          platform: 'chatgpt',
          label: 'Generate Ideas',
          prompt: 'Generate 5 content ideas about {{topic}}',
          contextStrategy: 'full'
        },
      },
      {
        id: '2',
        type: 'condition',
        position: { x: 100, y: 250 },
        data: { 
          label: 'Quality Check',
          condition: 'output_length > 500',
          operation: 'greater_than'
        },
      },
      {
        id: '3',
        type: 'ai-platform',
        position: { x: 300, y: 350 },
        data: { 
          platform: 'claude',
          label: 'Write Draft',
          prompt: 'Write a detailed article based on the best idea',
          contextStrategy: 'full'
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', label: 'Check quality' },
      { id: 'e2-3', source: '2', target: '3', label: 'If good' },
    ],
  },
  {
    id: 'fullstack-dev',
    name: 'Full-Stack Dev Project',
    description: 'Complete software development workflow from ideation to documentation',
    category: 'Development',
    tags: ['coding', 'development', 'software'],
    icon: '💻',
    isPublic: true,
    estimatedTime: 60,
    ratings: 4.9,
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: [
      {
        id: '1',
        type: 'ai-platform',
        position: { x: 100, y: 100 },
        data: { 
          platform: 'chatgpt',
          label: 'Brainstorm Features',
          prompt: 'List key features for {{project_type}}',
          contextStrategy: 'full'
        },
      },
      {
        id: '2',
        type: 'ai-platform',
        position: { x: 100, y: 250 },
        data: { 
          platform: 'claude',
          label: 'Design Architecture',
          prompt: 'Design system architecture for these features',
          contextStrategy: 'full'
        },
      },
      {
        id: '3',
        type: 'transform',
        position: { x: 100, y: 400 },
        data: { 
          label: 'Compress Context',
          operation: 'compress',
          ratio: 0.5
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
  },
];

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: exampleTemplates,
      currentTemplate: null,
      isLoading: false,
      error: null,

      fetchTemplates: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getTemplates();
          const backendTemplates = response.templates || [];
          
          // Merge with example templates (keep examples if no backend templates)
          const allTemplates = backendTemplates.length > 0 ? backendTemplates : exampleTemplates;
          
          set({ templates: allTemplates, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch templates:', error);
          set({ error: 'Failed to load templates', isLoading: false });
          // Keep example templates on error
          set({ templates: exampleTemplates });
        }
      },

      setCurrentTemplate: (template) => set({ currentTemplate: template }),
      
      updateCurrentTemplate: (updates) => {
        set((state) => ({
          currentTemplate: state.currentTemplate
            ? { ...state.currentTemplate, ...updates, updatedAt: new Date() }
            : null,
        }));
      },
      
      saveTemplate: async (template) => {
        set({ isLoading: true, error: null });
        try {
          const isNew = !get().templates.find((t) => t.id === template.id);
          
          if (isNew) {
            // Create new template
            const created = await api.createTemplate(template);
            set((state) => ({
              templates: [...state.templates, created],
              isLoading: false,
            }));
          } else {
            // Update existing template
            const updated = await api.updateTemplate(template.id, template);
            set((state) => ({
              templates: state.templates.map((t) => 
                t.id === template.id ? updated : t
              ),
              isLoading: false,
            }));
          }
        } catch (error) {
          console.error('Failed to save template:', error);
          set({ error: 'Failed to save template', isLoading: false });
          throw error;
        }
      },
      
      deleteTemplate: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await api.deleteTemplate(id);
          set((state) => ({
            templates: state.templates.filter((t) => t.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          console.error('Failed to delete template:', error);
          set({ error: 'Failed to delete template', isLoading: false });
          throw error;
        }
      },
      
      getTemplateById: (id) => {
        return get().templates.find((t) => t.id === id);
      },
      
      duplicateTemplate: async (id) => {
        const template = get().getTemplateById(id);
        if (template) {
          const newTemplate = {
            ...template,
            id: undefined as any, // Let backend generate new ID
            name: `${template.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await get().saveTemplate(newTemplate);
        }
      },
    }),
    {
      name: 'taskweave-templates',
    }
  )
);
