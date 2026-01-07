import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell, Palette, Globe, Shield, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    weeklyDigest: false,
    
    // Appearance
    theme: "system",
    compactMode: false,
    
    // AI Settings
    defaultPlatform: "chatgpt",
    autoCompress: true,
    compressionRatio: "70",
    
    // Privacy
    dataCollection: true,
    shareAnalytics: false,
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement API call to delete account
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your TaskWeave preferences and settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Bell className="inline h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your tasks
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get browser notifications for important updates
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, pushNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="task-reminders">Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Remind me about incomplete tasks
                  </p>
                </div>
                <Switch
                  id="task-reminders"
                  checked={settings.taskReminders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, taskReminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-digest">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your activity
                  </p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={settings.weeklyDigest}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, weeklyDigest: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Palette className="inline h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how TaskWeave looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => setSettings({ ...settings, theme: value })}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Show more content in less space
                  </p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={settings.compactMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, compactMode: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Globe className="inline h-5 w-5 mr-2" />
                AI Platform Settings
              </CardTitle>
              <CardDescription>Configure AI platform preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-platform">Default AI Platform</Label>
                <Select
                  value={settings.defaultPlatform}
                  onValueChange={(value) =>
                    setSettings({ ...settings, defaultPlatform: value })
                  }
                >
                  <SelectTrigger id="default-platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chatgpt">ChatGPT</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="perplexity">Perplexity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-compress">Auto-Compress Context</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically compress long conversations
                  </p>
                </div>
                <Switch
                  id="auto-compress"
                  checked={settings.autoCompress}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoCompress: checked })
                  }
                />
              </div>

              {settings.autoCompress && (
                <div className="space-y-2">
                  <Label htmlFor="compression-ratio">
                    Compression Ratio: {settings.compressionRatio}%
                  </Label>
                  <Input
                    id="compression-ratio"
                    type="range"
                    min="50"
                    max="90"
                    step="5"
                    value={settings.compressionRatio}
                    onChange={(e) =>
                      setSettings({ ...settings, compressionRatio: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher ratio = more compression (less detail)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Shield className="inline h-5 w-5 mr-2" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Control your data and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data-collection">Usage Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve TaskWeave by sharing anonymous usage data
                  </p>
                </div>
                <Switch
                  id="data-collection"
                  checked={settings.dataCollection}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, dataCollection: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="share-analytics">Share Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow aggregated analytics to be shared
                  </p>
                </div>
                <Switch
                  id="share-analytics"
                  checked={settings.shareAnalytics}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, shareAnalytics: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save All Settings
            </Button>
          </div>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">
                <Trash2 className="inline h-5 w-5 mr-2" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers, including:
                      <ul className="list-disc list-inside mt-2">
                        <li>All your tasks and conversations</li>
                        <li>Templates and workflows</li>
                        <li>Analytics and usage history</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

