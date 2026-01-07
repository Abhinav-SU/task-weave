import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Download, GitBranch, Play, Tag, Clock, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useTaskStore, AIPlatform } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageContent } from "@/components/MessageContent";
import { api } from "@/lib/api";
import { toast } from "sonner";

const platformIcons: Record<AIPlatform, string> = {
  chatgpt: "💬",
  claude: "🤖",
  gemini: "✨",
};

interface Conversation {
  id: string;
  platform: string;
  title?: string;
  created_at: string;
  message_count: number;
  messages?: Array<{
    id: string;
    sender: string;
    content: string;
    created_at: string;
  }>;
}

interface Execution {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  variables: Record<string, any>;
  results: Record<string, any>;
  started_at: string;
  completed_at: string | null;
  error: string | null;
  created_at: string;
}

const statusIcons = {
  pending: <Clock className="w-4 h-4 text-gray-500" />,
  running: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
  cancelled: <AlertCircle className="w-4 h-4 text-orange-500" />,
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, fetchTask } = useTaskStore();
  
  const [task, setTask] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExecutions, setIsLoadingExecutions] = useState(true);
  
  // Fetch task with conversations
  useEffect(() => {
    if (!id) return;
    
    const loadTaskDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch task details with conversations from backend
        const taskDetails = await api.getTask(id);
        console.log('✅ Task details loaded:', taskDetails);
        console.log('📊 Conversations:', taskDetails.conversations);
        
        setTask(taskDetails);
        
        if (taskDetails.conversations) {
          console.log('📝 Setting conversations:', taskDetails.conversations.length, 'conversations');
          taskDetails.conversations.forEach((conv: any, idx: number) => {
            console.log(`  Conv ${idx}:`, {
              id: conv.id,
              platform: conv.platform,
              messages: conv.messages?.length || 0
            });
          });
          setConversations(taskDetails.conversations);
        } else {
          console.log('⚠️ No conversations in task details');
        }
      } catch (error) {
        console.error('❌ Failed to load task details:', error);
        toast.error('Failed to load task details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTaskDetails();
  }, [id]);

  // Fetch workflow executions
  useEffect(() => {
    if (!id) return;
    
    const loadExecutions = async () => {
      setIsLoadingExecutions(true);
      try {
        const response = await api.listExecutions(id);
        console.log('✅ Executions loaded:', response);
        // API returns {executions: [...]} - extract the array
        const executionList = response?.executions || [];
        console.log('📋 Setting executions:', executionList.length);
        setExecutions(executionList);
      } catch (error) {
        console.error('❌ Failed to load executions:', error);
        // Don't show error toast - executions might not exist yet
      } finally {
        setIsLoadingExecutions(false);
      }
    };
    
    loadExecutions();
  }, [id]);

  if (!task) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Task not found</h2>
          <Button onClick={() => navigate('/dashboard/tasks')}>
            Back to Tasks
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/tasks')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold flex-1 break-words">{task.title}</h1>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="default" className="gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" size="default" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="default" size="default" className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
              <Play className="w-4 h-4" />
              Continue
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              {task.platform && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">
                    {platformIcons[task.platform as AIPlatform] || "💬"}
                  </span>
                </div>
              )}
              
              <p className="text-muted-foreground mb-6 break-words">{task.description || 'No description'}</p>

              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <GitBranch className="w-4 h-4" />
                  Create Branch
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Conversations</h2>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : conversations.length > 0 ? (
                <div className="space-y-6">
                  {conversations.map((conversation) => (
                    <Card key={conversation.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{conversation.platform}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {conversation.messages?.length || conversation.message_count || 0} messages
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conversation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {conversation.title && (
                        <h3 className="font-medium mb-2 break-words">{conversation.title}</h3>
                      )}
                      
                      {conversation.messages && conversation.messages.length > 0 && (
                        <div className="space-y-3 mt-4">
                          {conversation.messages.slice(0, 3).map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-4 rounded-lg ${
                                message.sender === 'user'
                                  ? 'bg-secondary/30 border border-secondary'
                                  : 'bg-primary/5 border border-primary/10'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <span className="font-semibold capitalize text-sm">{message.sender}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {new Date(message.created_at).toLocaleString()}
                                </span>
                              </div>
                              <MessageContent content={message.content} />
                            </motion.div>
                          ))}
                          {conversation.messages.length > 3 && (
                            <div className="text-center text-sm text-muted-foreground py-2">
                              + {conversation.messages.length - 3} more messages
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Capture conversations from ChatGPT or Claude using the browser extension</p>
                </div>
              )}
            </Card>

            {/* Workflow Executions */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Workflow Executions</h2>
              
              {isLoadingExecutions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : executions.length > 0 ? (
                <div className="space-y-4">
                  {executions.map((execution) => (
                    <Card key={execution.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {statusIcons[execution.status]}
                          <Badge variant="outline" className="capitalize">
                            {execution.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(execution.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      {execution.variables?.topic && (
                        <p className="text-sm mb-2">
                          <span className="font-medium">Topic:</span> {execution.variables.topic}
                        </p>
                      )}
                      
                      {execution.status === 'completed' && execution.results && (
                        <div className="mt-3 space-y-2">
                          {Object.entries(execution.results).map(([nodeId, result]) => {
                            if (nodeId.includes('end') || typeof result === 'object') return null;
                            return (
                              <div key={nodeId} className="p-2 bg-muted rounded text-xs">
                                <span className="font-medium">{nodeId}:</span>
                                <p className="mt-1 line-clamp-2">{String(result).substring(0, 150)}...</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {execution.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          <span className="font-medium">Error:</span> {execution.error}
                        </div>
                      )}
                      
                      {execution.status === 'running' && (
                        <div className="mt-2 text-sm text-muted-foreground animate-pulse">
                          Executing workflow...
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No workflow executions yet</p>
                  <p className="text-sm mt-2">Run a template to see execution results here</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Task Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className="capitalize">{task.status.replace('-', ' ')}</Badge>
                </div>

                {task.platform && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Platform</p>
                      <Badge variant="outline" className="capitalize">{task.platform}</Badge>
                    </div>
                  </>
                )}

                {task.tags && task.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Timeline
                  </p>
                  <p className="text-sm">
                    Created: {new Date(task.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    Updated: {new Date(task.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
