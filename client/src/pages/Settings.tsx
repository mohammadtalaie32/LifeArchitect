import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

type UserSetting = {
  id: number;
  userId: number;
  moduleName: string;
  isEnabled: boolean;
  displayOrder: number;
  settings: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
};

const Settings = () => {
  const { data: userSettings, isLoading: isLoadingSettings } = useQuery<UserSetting[]>({
    queryKey: ['/api/user/settings'],
  });
  
  const [moduleStates, setModuleStates] = useState<Record<string, boolean>>({});
  const [moduleSettings, setModuleSettings] = useState<Record<string, Record<string, any>>>({});
  const [activeTab, setActiveTab] = useState("modules");
  const { toast } = useToast();
  
  // Initialize module states when data is loaded
  useState(() => {
    if (userSettings) {
      const states: Record<string, boolean> = {};
      const settings: Record<string, Record<string, any>> = {};
      
      userSettings.forEach((setting) => {
        states[setting.moduleName] = setting.isEnabled;
        settings[setting.moduleName] = setting.settings || {};
      });
      
      setModuleStates(states);
      setModuleSettings(settings);
    }
  });
  
  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, isEnabled, settings }: { id: number, isEnabled?: boolean, settings?: Record<string, any> }) => {
      const response = await fetch(`/api/user/settings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isEnabled, settings })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleModuleToggle = (setting: UserSetting) => {
    const newState = !moduleStates[setting.moduleName];
    setModuleStates({ ...moduleStates, [setting.moduleName]: newState });
    
    updateSettingMutation.mutate({
      id: setting.id,
      isEnabled: newState
    });
  };
  
  const saveAllSettings = () => {
    if (!userSettings) return;
    
    userSettings.forEach((setting) => {
      if (moduleSettings[setting.moduleName]) {
        updateSettingMutation.mutate({
          id: setting.id,
          settings: moduleSettings[setting.moduleName]
        });
      }
    });
  };
  
  const handleSettingChange = (moduleName: string, key: string, value: any) => {
    setModuleSettings({
      ...moduleSettings,
      [moduleName]: {
        ...moduleSettings[moduleName],
        [key]: value
      }
    });
  };
  
  const renderModuleSettings = (setting: UserSetting) => {
    const moduleConfig = moduleSettings[setting.moduleName] || {};
    
    switch (setting.moduleName) {
      case "dashboard":
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Visible Widgets</h3>
            {["goals", "habits", "activities", "mood", "journal", "calendar"].map((widget) => (
              <div key={widget} className="flex items-center space-x-2">
                <Switch 
                  id={`widget-${widget}`}
                  checked={(moduleConfig.widgets || []).includes(widget)}
                  onCheckedChange={(checked) => {
                    const currentWidgets = [...(moduleConfig.widgets || [])];
                    const newWidgets = checked 
                      ? [...currentWidgets, widget]
                      : currentWidgets.filter(w => w !== widget);
                    
                    handleSettingChange(setting.moduleName, "widgets", newWidgets);
                  }}
                />
                <Label htmlFor={`widget-${widget}`} className="capitalize">{widget}</Label>
              </div>
            ))}
          </div>
        );
      
      case "habits":
      case "journal":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`reminder-${setting.moduleName}`}>Reminder Time</Label>
              <Input 
                id={`reminder-${setting.moduleName}`}
                type="time"
                value={moduleConfig.reminderTime || ""}
                onChange={(e) => handleSettingChange(setting.moduleName, "reminderTime", e.target.value)}
                className="mt-1 w-full"
              />
            </div>
          </div>
        );
      
      case "analytics":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="default-time-range">Default Time Range</Label>
              <select
                id="default-time-range"
                value={moduleConfig.defaultTimeRange || "month"}
                onChange={(e) => handleSettingChange(setting.moduleName, "defaultTimeRange", e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">No configurable settings for this module.</p>
          </div>
        );
    }
  };
  
  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your Life Architect experience</p>
        </div>
        {activeTab === "configuration" && (
          <Button onClick={saveAllSettings} disabled={updateSettingMutation.isPending}>
            {updateSettingMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All Changes
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="modules" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="modules">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSettings?.map((setting) => (
              <Card key={setting.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="capitalize">{setting.moduleName}</CardTitle>
                      <CardDescription>
                        {moduleDescriptions[setting.moduleName] || ""}
                      </CardDescription>
                    </div>
                    <Switch
                      checked={moduleStates[setting.moduleName] || false}
                      onCheckedChange={() => handleModuleToggle(setting)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="pt-2">
                    <Badge variant={moduleStates[setting.moduleName] ? "default" : "outline"}>
                      {moduleStates[setting.moduleName] ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="configuration">
          <div className="space-y-8">
            {userSettings?.filter(setting => moduleStates[setting.moduleName])
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((setting) => (
                <Card key={setting.id}>
                  <CardHeader>
                    <CardTitle className="capitalize">{setting.moduleName}</CardTitle>
                    <CardDescription>
                      {moduleDescriptions[setting.moduleName] || ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderModuleSettings(setting)}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const moduleDescriptions: Record<string, string> = {
  dashboard: "Overview of your personal development journey",
  goals: "Track and manage your short and long-term goals",
  habits: "Build and maintain positive daily routines",
  activities: "Organize tasks using the Eisenhower matrix",
  principles: "Define your core values and guiding principles",
  projects: "Manage complex projects with multiple tasks",
  journal: "Document your thoughts and reflections",
  mood: "Track your emotional well-being over time",
  calendar: "Plan and visualize your schedule",
  analytics: "Insights and visualizations of your progress"
};

export default Settings;