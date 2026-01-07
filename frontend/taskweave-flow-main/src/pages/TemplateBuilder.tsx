import { useCallback, useState, useRef, DragEvent, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AIPlatformNode } from '@/components/template-builder/AIPlatformNode';
import { ConditionNode } from '@/components/template-builder/ConditionNode';
import { TransformNode } from '@/components/template-builder/TransformNode';
import { MergeNode } from '@/components/template-builder/MergeNode';
import { AgentNode } from '@/components/template-builder/AgentNode';
import { MCPToolNode } from '@/components/template-builder/MCPToolNode';
import { NodePalette } from '@/components/template-builder/NodePalette';
import { PropertyPanel } from '@/components/template-builder/PropertyPanel';
import { TemplateMetadataEditor } from '@/components/template-builder/TemplateMetadataEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Play, Download, Share2, Undo, Redo, TestTube, Trash2 } from 'lucide-react';
import { useTemplateStore, WorkflowTemplate, TemplateMetadata } from '@/store/templateStore';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

// Register all node types
const nodeTypes: NodeTypes = {
  'ai-platform': AIPlatformNode,
  'condition': ConditionNode,
  'transform': TransformNode,
  'merge': MergeNode,
  // Agent nodes
  'agent': AgentNode,
  'agent-planner': AgentNode,
  'agent-executor': AgentNode,
  // MCP Tool nodes
  'mcp-web-search': MCPToolNode,
  'mcp-file': MCPToolNode,
  'mcp-database': MCPToolNode,
  'mcp-code-exec': MCPToolNode,
};

let nodeId = 0;
const getNodeId = () => `node_${nodeId++}`;

// Default edge style
const defaultEdgeOptions = {
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
  style: {
    strokeWidth: 2,
  },
};

export default function TemplateBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [metadata, setMetadata] = useState<Partial<TemplateMetadata>>({
    name: 'New Template',
    description: '',
    category: 'General',
    tags: [],
    icon: '📚',
    isPublic: false,
    estimatedTime: 5,
  });

  const { saveTemplate, getTemplateById } = useTemplateStore();

  // Load existing template if editing
  useEffect(() => {
    if (id) {
      const template = getTemplateById(id);
      if (template) {
        setNodes(template.nodes || []);
        setEdges(template.edges || []);
        setMetadata({
          name: template.name,
          description: template.description,
          category: template.category,
          tags: template.tags,
          icon: template.icon,
          isPublic: template.isPublic,
          estimatedTime: template.estimatedTime,
        });
        // Update nodeId to prevent collisions
        const maxId = Math.max(...template.nodes.map(n => {
          const match = n.id.match(/node_(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }), 0);
        nodeId = maxId + 1;
      }
    }
  }, [id, getTemplateById]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      ...defaultEdgeOptions,
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const nodeDataStr = event.dataTransfer.getData('node-data');
      const patternStr = event.dataTransfer.getData('pattern');
      
      if (!reactFlowWrapper.current) return;
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      // Handle pattern drop (multiple nodes)
      if (patternStr) {
        try {
          const pattern = JSON.parse(patternStr);
          const newNodes: any[] = [];
          const newEdges: any[] = [];
          let yOffset = 0;

          pattern.nodes.forEach((nodeTemplate: any, index: number) => {
            const newNodeId = getNodeId();
            newNodes.push({
              id: newNodeId,
              type: nodeTemplate.type,
              position: { 
                x: position.x, 
                y: position.y + yOffset 
              },
              data: {
                ...nodeTemplate.data,
                label: nodeTemplate.data?.label || `${nodeTemplate.type} node`,
              },
            });
            yOffset += 150;

            // Connect to previous node if not the first
            if (index > 0) {
              newEdges.push({
                id: `e${newNodes[index - 1].id}-${newNodeId}`,
                source: newNodes[index - 1].id,
                target: newNodeId,
                ...defaultEdgeOptions,
              });
            }
          });

          setNodes((nds) => nds.concat(newNodes));
          setEdges((eds) => eds.concat(newEdges));
          toast.success(`Added "${pattern.name}" pattern with ${pattern.nodes.length} nodes`);
        } catch (e) {
          console.error('Failed to parse pattern', e);
        }
        return;
      }

      // Handle single node drop
      if (!type) return;

      let nodeData = {};
      if (nodeDataStr) {
        try {
          nodeData = JSON.parse(nodeDataStr);
        } catch (e) {
          console.error('Failed to parse node data', e);
        }
      }

      // Set default data based on node type
      const defaultData = getDefaultNodeData(type, nodeData);

      const newNode = {
        id: getNodeId(),
        type,
        position,
        data: defaultData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleNodeUpdate = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data } : node
        )
      );
      // Update selected node if it's the one being updated
      setSelectedNode((sel: any) => 
        sel?.id === nodeId ? { ...sel, data } : sel
      );
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
      toast.success('Node deleted');
    }
  }, [selectedNode, setNodes, setEdges]);

  const handleSave = () => {
    if (!metadata.name) {
      toast.error('Please enter a template name');
      return;
    }

    if (nodes.length === 0) {
      toast.error('Please add at least one node');
      return;
    }

    // Calculate cost breakdown
    const llmBreakdown = nodes
      .filter(n => n.type === 'ai-platform')
      .map(n => {
        const platform = n.data.platform || 'chatgpt';
        const model = n.data.model || '';
        const costTier = platform === 'gemini' ? 'low' : 
                        platform === 'claude' ? 'high' : 'medium';
        return {
          model: model || platform,
          role: n.data.label || 'AI Task',
          costTier,
        };
      });

    const template: WorkflowTemplate = {
      id: id || `template-${Date.now()}`,
      name: metadata.name || 'New Template',
      description: metadata.description || '',
      category: metadata.category || 'General',
      tags: metadata.tags || [],
      icon: metadata.icon || '📚',
      isPublic: metadata.isPublic || false,
      estimatedTime: metadata.estimatedTime || 5,
      estimatedCost: calculateCostEstimate(nodes),
      costStrategy: generateCostStrategy(nodes),
      llmBreakdown,
      nodes,
      edges,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    saveTemplate(template);
    toast.success('Template saved successfully!');
    navigate('/dashboard/templates');
  };

  const handleTest = () => {
    toast.info('Opening test dialog...', {
      description: 'Template testing with sample inputs coming soon!',
    });
  };

  const handleExport = () => {
    const template = {
      metadata,
      nodes,
      edges,
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(metadata.name || 'template').replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    toast.success('Template exported!');
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    nodeId = 0;
    toast.success('Canvas cleared');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Template Builder</h1>
            <p className="text-sm text-muted-foreground">
              Drag nodes from the palette to create your workflow
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleClear}>
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleTest}>
              <TestTube className="w-4 h-4" />
              Test
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button size="sm" className="gap-2 gradient-primary text-white" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save Template
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-12 gap-4">
          {/* Node Palette */}
          <div className="col-span-3 min-h-0">
            <NodePalette />
          </div>

          {/* Canvas */}
          <div className="col-span-6 bg-card rounded-lg border border-border overflow-hidden" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              fitView
              className="bg-slate-50 dark:bg-slate-900/50"
            >
              <Background color="#888" gap={16} size={1} />
              <Controls />
              <MiniMap
                nodeStrokeWidth={3}
                zoomable
                pannable
                className="bg-card"
              />
              <Panel position="top-center" className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium">
                    {nodes.length} nodes
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-medium">
                    {edges.length} connections
                  </span>
                  {selectedNode && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <Badge variant="secondary" className="text-xs">
                        Selected: {selectedNode.data.label || selectedNode.id}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-destructive hover:text-destructive"
                        onClick={handleDeleteNode}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </Panel>

              {/* Empty state */}
              {nodes.length === 0 && (
                <Panel position="top-center" className="mt-32">
                  <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-xl border shadow-lg">
                    <div className="text-4xl mb-4">🎨</div>
                    <h3 className="text-lg font-semibold mb-2">Start Building</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Drag nodes from the palette on the left, or drop a pre-built pattern to get started quickly.
                    </p>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </div>

          {/* Properties Panel */}
          <div className="col-span-3 space-y-4 min-h-0 flex flex-col">
            <div className="flex-shrink-0">
              <TemplateMetadataEditor
                metadata={metadata}
                onChange={setMetadata}
              />
            </div>
            <div className="flex-1 min-h-0">
              <PropertyPanel
                selectedNode={selectedNode}
                onUpdate={handleNodeUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helper function to get default node data based on type
function getDefaultNodeData(type: string, existingData: any = {}) {
  const defaults: Record<string, any> = {
    'ai-platform': {
      label: 'AI Node',
      platform: 'gemini',
      model: 'gemini-2.5-flash',
      prompt: '',
      maxTokens: 1000,
      temperature: 0.7,
    },
    'condition': {
      label: 'Condition',
      variable: '',
      operation: 'greater_than',
      compareValue: '',
    },
    'transform': {
      label: 'Transform',
      operation: 'extract',
      expression: '',
    },
    'merge': {
      label: 'Merge',
      strategy: 'concatenate',
    },
    'agent': {
      label: 'AI Agent',
      goal: '',
      model: 'gpt-4o',
      tools: [],
      maxIterations: 5,
    },
    'agent-planner': {
      label: 'Planner Agent',
      goal: 'Plan the approach',
      model: 'gpt-4o',
      tools: [],
    },
    'agent-executor': {
      label: 'Executor Agent',
      goal: 'Execute the plan',
      model: 'gpt-4o',
      tools: [],
    },
    'mcp-web-search': {
      label: 'Web Search',
      query: '',
      maxResults: 5,
    },
    'mcp-file': {
      label: 'File Operation',
      path: '',
      operation: 'read',
    },
    'mcp-database': {
      label: 'Database Query',
      query: '',
      connection: 'default',
    },
    'mcp-code-exec': {
      label: 'Code Execution',
      language: 'python',
      code: '',
    },
  };

  return {
    ...defaults[type] || { label: `${type} node` },
    ...existingData,
  };
}

// Calculate estimated cost based on nodes
function calculateCostEstimate(nodes: any[]): string {
  let minCost = 0;
  let maxCost = 0;

  nodes.forEach(node => {
    if (node.type === 'ai-platform') {
      const platform = node.data.platform;
      if (platform === 'gemini') {
        minCost += 0.005;
        maxCost += 0.01;
      } else if (platform === 'chatgpt') {
        minCost += 0.01;
        maxCost += 0.03;
      } else if (platform === 'claude') {
        minCost += 0.02;
        maxCost += 0.05;
      } else {
        minCost += 0.01;
        maxCost += 0.02;
      }
    } else if (node.type?.startsWith('agent')) {
      minCost += 0.02;
      maxCost += 0.10;
    } else if (node.type?.startsWith('mcp-')) {
      minCost += 0.001;
      maxCost += 0.005;
    }
  });

  return `$${minCost.toFixed(2)} - $${maxCost.toFixed(2)}`;
}

// Generate cost strategy description
function generateCostStrategy(nodes: any[]): string {
  const platforms = nodes
    .filter(n => n.type === 'ai-platform')
    .map(n => n.data.platform);
  
  const hasGemini = platforms.includes('gemini');
  const hasGPT = platforms.includes('chatgpt');
  const hasClaude = platforms.includes('claude');
  
  if (hasGemini && hasGPT && !hasClaude) {
    return 'Gemini for bulk work, GPT-4 for precision tasks. Cost-optimized.';
  } else if (hasGemini && !hasGPT && !hasClaude) {
    return 'All Gemini - maximum cost savings.';
  } else if (!hasGemini && hasGPT) {
    return 'GPT-4 powered workflow - higher quality, higher cost.';
  } else if (hasClaude) {
    return 'Includes Claude for premium writing/analysis quality.';
  }
  
  return 'Custom multi-LLM workflow.';
}
