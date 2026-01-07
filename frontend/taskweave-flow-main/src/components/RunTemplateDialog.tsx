import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTaskStore } from "@/store/taskStore";

interface RunTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateName: string;
  templateMetadata?: any;
  onSuccess?: (executionId: string, taskId: string) => void;
}

export function RunTemplateDialog({
  open,
  onOpenChange,
  templateId,
  templateName,
  templateMetadata,
  onSuccess,
}: RunTemplateDialogProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [requiredVars, setRequiredVars] = useState<string[]>([]);
  const [useExistingTask, setUseExistingTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const { toast } = useToast();
  const { tasks } = useTaskStore();

  // Extract variables from template metadata
  useEffect(() => {
    if (templateMetadata?.nodes) {
      const varSet = new Set<string>();
      const regex = /\{\{(\w+)\}\}/g;
      
      templateMetadata.nodes.forEach((node: any) => {
        if (node.data?.prompt) {
          let match;
          while ((match = regex.exec(node.data.prompt)) !== null) {
            const varName = match[1];
            // Skip node references (node_1, node_2, node_X_output, etc.)
            if (!varName.match(/^node_\d+$/) && !varName.match(/^node_\d+_output$/)) {
              varSet.add(varName);
            }
          }
        }
      });

      const vars = Array.from(varSet);
      setRequiredVars(vars);
      
      // Initialize variables object
      const initialVars: Record<string, string> = {};
      vars.forEach(v => initialVars[v] = "");
      setVariables(initialVars);
    }
  }, [templateMetadata]);

  const handleVariableChange = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const handleRun = async () => {
    // Check all required variables are filled
    const missingVars = requiredVars.filter(v => !variables[v]?.trim());
    if (missingVars.length > 0) {
      toast({
        title: "Missing Input",
        description: `Please provide: ${missingVars.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);

    try {
      let taskId = selectedTaskId;

      // Create a new task if not using existing
      if (!useExistingTask || !taskId) {
        const firstVar = requiredVars[0] || "workflow";
        const inputPreview = variables[firstVar]?.substring(0, 50) || "execution";
        
        const taskResponse: any = await api.createTask({
          title: `${templateName} - ${inputPreview}`,
          description: `Workflow execution for template: ${templateName}`,
          status: "active",
          priority: "medium",
        });
        taskId = taskResponse.id;
      }

      // Execute workflow - pass templateData for client-side templates
      // Check if templateId is a UUID (database template) or string ID (client-side template)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(templateId);
      
      const execution: any = await api.executeWorkflow(
        taskId,
        variables,
        isUUID 
          ? { templateId }  // Database template - pass ID
          : { templateData: { name: templateName, nodes: templateMetadata?.nodes || [], edges: templateMetadata?.edges || [] } }  // Client-side template - pass data
      );

      toast({
        title: "Workflow Started",
        description: `Execution started successfully. ID: ${execution.id}`,
      });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess(execution.id, taskId);
      }
    } catch (error: any) {
      console.error("Failed to execute workflow:", error);
      toast({
        title: "Execution Failed",
        description: error.message || "Failed to start workflow execution",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Run Template: {templateName}
          </DialogTitle>
          <DialogDescription>
            Provide the required inputs to execute this workflow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Dynamic Variable Inputs */}
          {requiredVars.map((varName) => (
            <div key={varName} className="space-y-2">
              <Label htmlFor={varName} className="capitalize">
                {varName.replace(/_/g, " ")} *
              </Label>
              {varName === "code" || varName.includes("description") || varName.includes("content") ? (
                <Textarea
                  id={varName}
                  placeholder={`Enter ${varName}...`}
                  value={variables[varName] || ""}
                  onChange={(e) => handleVariableChange(varName, e.target.value)}
                  disabled={isRunning}
                  rows={8}
                  className="font-mono text-sm"
                />
              ) : (
                <Input
                  id={varName}
                  placeholder={`Enter ${varName}...`}
                  value={variables[varName] || ""}
                  onChange={(e) => handleVariableChange(varName, e.target.value)}
                  disabled={isRunning}
                />
              )}
            </div>
          ))}

          {requiredVars.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No input variables required for this template.
            </p>
          )}

          {/* Optional: Choose Task */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useExisting"
                checked={useExistingTask}
                onChange={(e) => setUseExistingTask(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="useExisting" className="cursor-pointer">
                Link to existing task
              </Label>
            </div>

            {useExistingTask && (
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRunning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRun}
            disabled={isRunning || requiredVars.some(v => !variables[v]?.trim())}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Workflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
