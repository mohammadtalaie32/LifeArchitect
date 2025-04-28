import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Edit, Trash, Check, X, Clock, Calendar } from "lucide-react";
import { z } from "zod";
import { insertActivitySchema } from "@shared/schema";
import { format } from "date-fns";

// Define activity form schema with validation
const activityFormSchema = insertActivitySchema.extend({
  dueDate: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

// Define quadrant type
type Quadrant = 
  | 'urgent-important'
  | 'not-urgent-important'
  | 'urgent-not-important'
  | 'not-urgent-not-important';

const quadrantLabels: Record<Quadrant, string> = {
  'urgent-important': 'Urgent & Important',
  'not-urgent-important': 'Not Urgent & Important',
  'urgent-not-important': 'Urgent & Not Important',
  'not-urgent-not-important': 'Not Urgent & Not Important'
};

const quadrantDescriptions: Record<Quadrant, string> = {
  'urgent-important': 'Do these tasks immediately',
  'not-urgent-important': 'Schedule time to do these tasks',
  'urgent-not-important': 'Delegate these tasks if possible',
  'not-urgent-not-important': 'Eliminate these tasks when possible'
};

const iconOptions = [
  { value: 'file-text', label: 'File' },
  { value: 'users', label: 'Users' },
  { value: 'book', label: 'Book' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'code', label: 'Code' },
  { value: 'mail', label: 'Mail' },
  { value: 'phone', label: 'Phone' },
  { value: 'briefcase', label: 'Briefcase' },
  { value: 'shopping-bag', label: 'Shopping' },
  { value: 'heart', label: 'Heart' },
  { value: 'home', label: 'Home' },
];

const colorOptions = [
  { value: '#e63946', label: 'Red' },
  { value: '#457b9d', label: 'Blue' },
  { value: '#06d6a0', label: 'Green' },
  { value: '#ffb703', label: 'Yellow' },
  { value: '#6a4c93', label: 'Purple' },
  { value: '#f4a261', label: 'Orange' },
  { value: '#e76f51', label: 'Coral' },
  { value: '#2a9d8f', label: 'Teal' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function Activities() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch activities
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/activities'],
    queryFn: () => apiRequest<any[]>('/api/activities'),
  });

  // Create activity mutation
  const createActivity = useMutation({
    mutationFn: (data: ActivityFormValues) => 
      apiRequest('/api/activities', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Activity created",
        description: "The activity has been created successfully.",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create activity",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  // Update activity mutation
  const updateActivity = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<ActivityFormValues> }) => 
      apiRequest(`/api/activities/${id}`, { method: 'PUT', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Activity updated",
        description: "The activity has been updated successfully.",
      });
      setIsDialogOpen(false);
      setEditingActivity(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update activity",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete activity mutation
  const deleteActivity = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/activities/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Activity deleted",
        description: "The activity has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete activity",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  // Set up activity form
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: '',
      description: '',
      quadrant: 'urgent-important',
      status: 'pending',
      priority: 0,
      icon: 'file-text',
      color: '#457b9d',
    },
  });

  // Update form when editing activity
  useEffect(() => {
    if (editingActivity) {
      const formattedActivity = {
        ...editingActivity,
        dueDate: editingActivity.dueDate ? 
          format(new Date(editingActivity.dueDate), 'yyyy-MM-dd') : undefined,
      };
      form.reset(formattedActivity);
    } else {
      form.reset({
        title: '',
        description: '',
        quadrant: 'urgent-important',
        status: 'pending',
        priority: 0,
        icon: 'file-text',
        color: '#457b9d',
      });
    }
  }, [editingActivity, form]);

  // Handle form submission
  const onSubmit = (data: ActivityFormValues) => {
    const formattedData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      priority: Number(data.priority),
      estimatedTime: data.estimatedTime ? Number(data.estimatedTime) : undefined,
    };

    if (editingActivity) {
      updateActivity.mutate({ id: editingActivity.id, data: formattedData });
    } else {
      createActivity.mutate(formattedData);
    }
  };

  // Group activities by quadrant
  const groupedActivities = activities?.reduce((acc, activity) => {
    if (!acc[activity.quadrant]) {
      acc[activity.quadrant] = [];
    }
    acc[activity.quadrant].push(activity);
    return acc;
  }, {} as Record<string, any[]>) || {};

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'in-progress': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const renderActivityCards = (activitiesList: any[]) => {
    return activitiesList.map((activity) => (
      <Card key={activity.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {activity.icon && renderIcon(activity.icon)}
                <span style={{ color: activity.color }}>{activity.title}</span>
              </CardTitle>
              <CardDescription>{activity.description}</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(activity.status)}>
              {activity.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {activity.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Due: {format(new Date(activity.dueDate), 'MMM d, yyyy')}</span>
              </div>
            )}
            {activity.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Est: {Math.floor(activity.estimatedTime / 60)}h {activity.estimatedTime % 60}m</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingActivity(activity);
                setIsDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteActivity.mutate(activity.id)}
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
    ));
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = {
      'file-text': () => <span className="text-lg material-icons">description</span>,
      'users': () => <span className="text-lg material-icons">group</span>,
      'book': () => <span className="text-lg material-icons">book</span>,
      'calendar': () => <span className="text-lg material-icons">event</span>,
      'code': () => <span className="text-lg material-icons">code</span>,
      'mail': () => <span className="text-lg material-icons">email</span>,
      'phone': () => <span className="text-lg material-icons">phone</span>,
      'briefcase': () => <span className="text-lg material-icons">work</span>,
      'shopping-bag': () => <span className="text-lg material-icons">shopping_bag</span>,
      'heart': () => <span className="text-lg material-icons">favorite</span>,
      'home': () => <span className="text-lg material-icons">home</span>,
    }[iconName];

    return IconComponent ? <IconComponent /> : null;
  };

  // Filter activities based on active tab
  const filterActivities = () => {
    if (activeTab === 'all') {
      return activities || [];
    } else {
      return activities?.filter(activity => activity.quadrant === activeTab) || [];
    }
  };

  const quadrantTitles: Record<Quadrant, string> = {
    'urgent-important': 'Do',
    'not-urgent-important': 'Schedule',
    'urgent-not-important': 'Delegate',
    'not-urgent-not-important': 'Eliminate'
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eisenhower Matrix</h1>
          <p className="text-muted-foreground">
            Manage your tasks based on urgency and importance
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-2 sm:mt-0" onClick={() => setEditingActivity(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingActivity ? "Edit Activity" : "Create Activity"}
              </DialogTitle>
              <DialogDescription>
                {editingActivity 
                  ? "Update the details of your activity" 
                  : "Add a new activity to your Eisenhower Matrix"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quadrant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quadrant</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quadrant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(quadrantLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority (0-9)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            max="9" 
                            placeholder="0-9" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Time (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0"
                            placeholder="Minutes" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="actualTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actual Time (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0"
                            placeholder="Minutes" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select icon" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {iconOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center">
                                  {renderIcon(option.value)}
                                  <span className="ml-2">{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colorOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center">
                                  <div 
                                    className="w-4 h-4 rounded-full mr-2" 
                                    style={{ backgroundColor: option.value }}
                                  />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingActivity(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createActivity.isPending || updateActivity.isPending}>
                    {(createActivity.isPending || updateActivity.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingActivity ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="urgent-important">Do</TabsTrigger>
              <TabsTrigger value="not-urgent-important">Schedule</TabsTrigger>
              <TabsTrigger value="urgent-not-important">Delegate</TabsTrigger>
              <TabsTrigger value="not-urgent-not-important">Eliminate</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(quadrantTitles).map((quadrant) => (
                  <Card key={quadrant} className="shadow-md">
                    <CardHeader>
                      <CardTitle>{quadrantTitles[quadrant as Quadrant]}</CardTitle>
                      <CardDescription>{quadrantDescriptions[quadrant as Quadrant]}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {groupedActivities[quadrant]?.length > 0 ? (
                        renderActivityCards(groupedActivities[quadrant])
                      ) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No activities in this quadrant
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {Object.keys(quadrantTitles).map((quadrant) => (
              <TabsContent key={quadrant} value={quadrant}>
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>{quadrantTitles[quadrant as Quadrant]}</CardTitle>
                    <CardDescription>{quadrantDescriptions[quadrant as Quadrant]}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {groupedActivities[quadrant]?.length > 0 ? (
                      renderActivityCards(groupedActivities[quadrant])
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No activities in this quadrant
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}

export default Activities;