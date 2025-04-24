import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Goal } from "@shared/schema";
import { format, parseISO, addDays } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle, Clock, Edit, Plus, Trash2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDaysRemaining } from "@/lib/dateUtils";

const goalFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetDate: z.date().optional(),
  totalSteps: z.number().min(1, "At least one step is required"),
  progress: z.number().min(0, "Progress cannot be negative"),
  color: z.string().min(1, "Color is required"),
  category: z.string().optional(),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

export default function Goals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const { toast } = useToast();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['/api/goals'],
  });

  // Filter goals based on active tab
  const activeGoals = goals.filter((goal: Goal) => !goal.completed);
  const completedGoals = goals.filter((goal: Goal) => goal.completed);
  
  const displayGoals = activeTab === "active" ? activeGoals : completedGoals;

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      totalSteps: 1,
      progress: 0,
      color: "#4F46E5",
      category: "",
    }
  });

  const createGoal = useMutation({
    mutationFn: async (values: GoalFormValues) => {
      const formattedValues = {
        ...values,
        completed: false,
      };
      return apiRequest("POST", "/api/goals", formattedValues);
    },
    onSuccess: () => {
      toast({
        title: "Goal created",
        description: "Your goal has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create goal",
        description: "There was an error creating your goal",
        variant: "destructive",
      });
    }
  });

  const updateGoal = useMutation({
    mutationFn: async (values: GoalFormValues & { id: number, completed?: boolean }) => {
      const { id, ...data } = values;
      return apiRequest("PUT", `/api/goals/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Goal updated",
        description: "Your goal has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to update goal",
        description: "There was an error updating your goal",
        variant: "destructive",
      });
    }
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete goal",
        description: "There was an error deleting your goal",
        variant: "destructive",
      });
    }
  });

  const toggleGoalCompletion = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      return apiRequest("PUT", `/api/goals/${id}`, { completed });
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.completed ? "Goal completed" : "Goal reopened",
        description: variables.completed ? "Congratulations on completing your goal!" : "Goal has been reopened",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update goal",
        description: "There was an error updating your goal status",
        variant: "destructive",
      });
    }
  });

  const increaseProgress = useMutation({
    mutationFn: async ({ id, progress, totalSteps }: { id: number, progress: number, totalSteps: number }) => {
      const newProgress = progress + 1;
      const completed = newProgress >= totalSteps;
      
      return apiRequest("PUT", `/api/goals/${id}`, { 
        progress: newProgress,
        completed
      });
    },
    onSuccess: (_, variables) => {
      const newProgress = variables.progress + 1;
      const completed = newProgress >= variables.totalSteps;
      
      if (completed) {
        toast({
          title: "Goal completed",
          description: "Congratulations on completing your goal!",
        });
      } else {
        toast({
          title: "Progress updated",
          description: `Progress updated to ${newProgress}/${variables.totalSteps}`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update progress",
        description: "There was an error updating your goal progress",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: GoalFormValues) => {
    if (currentGoal) {
      updateGoal.mutate({ ...values, id: currentGoal.id });
    } else {
      createGoal.mutate(values);
    }
  };

  const handleNewGoal = () => {
    setCurrentGoal(null);
    form.reset({
      title: "",
      description: "",
      totalSteps: 1,
      progress: 0,
      color: "#4F46E5",
      category: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setCurrentGoal(goal);
    form.reset({
      title: goal.title,
      description: goal.description || "",
      targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
      totalSteps: goal.totalSteps,
      progress: goal.progress,
      color: goal.color || "#4F46E5",
      category: goal.category || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteGoal = (goal: Goal) => {
    setCurrentGoal(goal);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentGoal) {
      deleteGoal.mutate(currentGoal.id);
    }
  };

  const handleToggleCompletion = (goal: Goal) => {
    toggleGoalCompletion.mutate({
      id: goal.id,
      completed: !goal.completed
    });
  };

  const handleIncreaseProgress = (goal: Goal) => {
    if (goal.progress < goal.totalSteps) {
      increaseProgress.mutate({
        id: goal.id,
        progress: goal.progress,
        totalSteps: goal.totalSteps
      });
    }
  };

  const getCategoryClass = (category?: string) => {
    if (!category) return "bg-slate-100 text-slate-800";
    
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes("learning")) return "bg-primary-100 text-primary-800";
    if (lowerCategory.includes("health") || lowerCategory.includes("wellness")) return "bg-secondary-100 text-secondary-800";
    if (lowerCategory.includes("career") || lowerCategory.includes("work")) return "bg-accent-100 text-accent-800";
    if (lowerCategory.includes("social")) return "bg-blue-100 text-blue-800";
    
    return "bg-slate-100 text-slate-800";
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Goals</h1>
          <p className="text-sm text-slate-500">Track progress toward your short and long-term goals</p>
        </div>
        <Button onClick={handleNewGoal}>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">Active Goals ({activeGoals.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Goals ({completedGoals.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-opacity-20 border-t-primary rounded-full"></div>
        </div>
      ) : displayGoals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-medium text-slate-700 mb-2">
              {activeTab === "active" ? "No Active Goals" : "No Completed Goals"}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              {activeTab === "active"
                ? "Create some goals to track your progress and achievements."
                : "Complete some goals to see them here."}
            </p>
            {activeTab === "active" && (
              <Button onClick={handleNewGoal}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Goal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayGoals.map((goal: Goal) => {
            const progressPercentage = Math.round((goal.progress / goal.totalSteps) * 100);
            const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
            const daysRemaining = targetDate ? formatDaysRemaining(targetDate) : null;
            
            return (
              <Card key={goal.id} className="overflow-hidden">
                <div
                  className="h-2"
                  style={{ backgroundColor: goal.color || "#4F46E5" }}
                ></div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditGoal(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteGoal(goal)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {goal.category && (
                    <div className="mt-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryClass(goal.category)}`}>
                        {goal.category}
                      </span>
                    </div>
                  )}
                  {goal.description && (
                    <CardDescription className="mt-2 text-sm">
                      {goal.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Progress</span>
                      <span className="text-slate-600">{goal.progress} of {goal.totalSteps} {goal.totalSteps === 1 ? 'step' : 'steps'}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    
                    {targetDate && (
                      <div className="flex items-center text-sm text-slate-600 mt-1">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{daysRemaining}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="pt-3">
                  <div className="flex items-center w-full space-x-2">
                    {!goal.completed && goal.progress < goal.totalSteps && (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleIncreaseProgress(goal)}
                        disabled={increaseProgress.isPending}
                      >
                        Update Progress
                      </Button>
                    )}
                    <Button
                      variant={goal.completed ? "outline" : "default"}
                      className="flex-1"
                      onClick={() => handleToggleCompletion(goal)}
                      disabled={toggleGoalCompletion.isPending}
                    >
                      {goal.completed ? "Reopen Goal" : "Mark Complete"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* New/Edit Goal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
            <DialogDescription>
              {currentGoal
                ? "Update your goal details below"
                : "Set a clear, achievable goal for yourself"}
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
                      <Input placeholder="e.g., Complete coding course" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add more details about your goal..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalSteps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Steps</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="progress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Progress</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          max={form.watch('totalSteps')}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Target Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Learning">Learning</SelectItem>
                          <SelectItem value="Wellness">Wellness</SelectItem>
                          <SelectItem value="Career">Career</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Social">Social</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
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
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: field.value }}
                        ></div>
                        <FormControl>
                          <Input type="color" {...field} className="w-full" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createGoal.isPending || updateGoal.isPending}
                >
                  {createGoal.isPending || updateGoal.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                      Saving...
                    </div>
                  ) : (
                    currentGoal ? "Update Goal" : "Create Goal"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the goal "{currentGoal?.title}". This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteGoal.isPending}
            >
              {deleteGoal.isPending ? "Deleting..." : "Delete Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
