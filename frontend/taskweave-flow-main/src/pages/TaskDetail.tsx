import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Download, GitBranch, Play, Tag, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useTaskStore, AIPlatform } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const platformIcons: Record<AIPlatform, string> = {
  chatgpt: "💬",
  claude: "🤖",
  gemini: "✨",
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tasks = useTaskStore((state) => state.tasks);
  const task = tasks.find((t) => t.id === id);

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
              <h2 className="text-xl font-bold mb-4">Conversation Timeline</h2>
              
              {task.messages.length > 0 ? (
                <div className="space-y-4">
                  {task.messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-secondary/20 ml-8'
                          : 'bg-primary/10 mr-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{platformIcons[message.platform]}</span>
                        <span className="font-medium capitalize">{message.role}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet
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
