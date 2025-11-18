import { useCallback, useState, useRef, DragEvent } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AIPlatformNode } from '@/components/template-builder/AIPlatformNode';
import { ConditionNode } from '@/components/template-builder/ConditionNode';
import { TransformNode } from '@/components/template-builder/TransformNode';
import { MergeNode } from '@/components/template-builder/MergeNode';
import { NodePalette } from '@/components/template-builder/NodePalette';
import { PropertyPanel } from '@/components/template-builder/PropertyPanel';
import { TemplateMetadataEditor } from '@/components/template-builder/TemplateMetadataEditor';
import { Button } from '@/components/ui/button';
import { Save, Play, Download, Share2, Undo, Redo } from 'lucide-react';
import { useTemplateStore, WorkflowTemplate, TemplateMetadata } from '@/store/templateStore';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

const nodeTypes: NodeTypes = {
  'ai-platform': AIPlatformNode,
  'condition': ConditionNode,
  'transform': TransformNode,
  'merge': MergeNode,
};

let nodeId = 0;
const getNodeId = () => `node_${nodeId++}`;

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
    estimatedTime: 30,
  });

  const { saveTemplate, getTemplateById } = useTemplateStore();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
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
      if (!type || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: getNodeId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
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
    },
    [setNodes]
  );

  const handleSave = () => {
    const template: WorkflowTemplate = {
      id: id || `template-${Date.now()}`,
      name: metadata.name || 'New Template',
      description: metadata.description || '',
      category: metadata.category || 'General',
      tags: metadata.tags || [],
      icon: metadata.icon || '📚',
      isPublic: metadata.isPublic || false,
      estimatedTime: metadata.estimatedTime || 30,
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
    toast.info('Template testing coming soon!');
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
    a.download = `${metadata.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    toast.success('Template exported!');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Template Builder</h1>
            <p className="text-sm text-muted-foreground">
              Design your workflow visually
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleTest}>
              <Play className="w-4 h-4" />
              Test
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button size="sm" className="gap-2 gradient-primary text-white" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4">
          <div className="col-span-2">
            <NodePalette />
          </div>

          <div className="col-span-7 bg-card rounded-lg border border-border overflow-hidden" ref={reactFlowWrapper}>
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
              fitView
            >
              <Background />
              <Controls />
              <MiniMap
                nodeStrokeWidth={3}
                zoomable
                pannable
                className="bg-card"
              />
              <Panel position="top-center" className="bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">
                  {nodes.length} nodes, {edges.length} connections
                </span>
              </Panel>
            </ReactFlow>
          </div>

          <div className="col-span-3 space-y-4">
            <TemplateMetadataEditor
              metadata={metadata}
              onChange={setMetadata}
            />
            <PropertyPanel
              selectedNode={selectedNode}
              onUpdate={handleNodeUpdate}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
