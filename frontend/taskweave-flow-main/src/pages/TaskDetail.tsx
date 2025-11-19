import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Download, GitBranch, Play, Tag, Clock, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useTaskStore, AIPlatform } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, fetchTask } = useTaskStore();
  const task = tasks.find((t) => t.id === id);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch task with conversations
  useEffect(() => {
    if (!id) return;
    
    const loadTaskDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch task details with conversations from backend
        const taskDetails = await api.getTask(id);
        console.log('✅ Task details loaded:', taskDetails);
        
        if (taskDetails.conversations) {
          setConversations(taskDetails.conversations);
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
          <h1 className="text-3xl font-bold flex-1">{task.title}</h1>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="gradient-primary text-white gap-2">
              <Play className="w-4 h-4" />
              Continue
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {task.platforms.map((platform) => (
                  <span key={platform} className="text-2xl">
                    {platformIcons[platform]}
                  </span>
                ))}
              </div>
              
              <p className="text-muted-foreground mb-6">{task.description}</p>

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
                            {conversation.message_count} messages
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conversation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {conversation.title && (
                        <h3 className="font-medium mb-2">{conversation.title}</h3>
                      )}
                      
                      {conversation.messages && conversation.messages.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {conversation.messages.slice(0, 3).map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-3 rounded-lg text-sm ${
                                message.sender === 'user'
                                  ? 'bg-secondary/20 ml-4'
                                  : 'bg-primary/10 mr-4'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium capitalize">{message.sender}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {new Date(message.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </motion.div>
                          ))}
                          {conversation.message_count > 3 && (
                            <div className="text-center text-sm text-muted-foreground">
                              + {conversation.message_count - 3} more messages
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
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Task Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className="capitalize">{task.status.replace('-', ' ')}</Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Priority</p>
                  <Badge variant="outline" className="capitalize">{task.priority}</Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Context Size</p>
                  <p className="font-medium">{task.contextSize} KB</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Timeline
                  </p>
                  <p className="text-sm">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    Updated: {new Date(task.updatedAt).toLocaleDateString()}
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
