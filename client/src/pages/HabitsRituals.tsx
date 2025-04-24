import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Habit, HabitEntry } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, subDays, addDays } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HabitItem from "@/components/dashboard/HabitItem";
import { 
  Calendar, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Plus, 
  Rocket, 
  Trash2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const habitFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  frequency: z.string().min(1, "Frequency is required"),
  timeOfDay: z.string().optional(),
});

type HabitFormValues = z.infer<typeof habitFormSchema>;

export default function HabitsRituals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentHabit, setCurrentHabit] = useState<Habit | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toast } = useToast();

  const { data: habits = [], isLoading: isLoadingHabits } = useQuery({
    queryKey: ['/api/habits'],
  });

  const { data: habitEntries = [], isLoading: isLoadingEntries } = useQuery({
    queryKey: ['/api/habit-entries', currentDate.toISOString()],
    queryFn: async () => {
      const res = await fetch(`/api/habit-entries?date=${currentDate.toISOString()}`);
      if (!res.ok) throw new Error('Failed to fetch habit entries');
      return res.json();
    },
  });

  // Filter habits based on active tab
  const filteredHabits = activeTab === "all" 
    ? habits 
    : habits.filter((habit: Habit) => habit.frequency === activeTab || habit.timeOfDay === activeTab);

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      title: "",
      description: "",
      frequency: "daily",
      timeOfDay: "",
    }
  });

  const createHabit = useMutation({
    mutationFn: async (values: HabitFormValues) => {
      return apiRequest("POST", "/api/habits", values);
    },
    onSuccess: () => {
      toast({
        title: "Habit created",
        description: "Your habit has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create habit",
        description: "There was an error creating your habit",
        variant: "destructive",
      });
    }
  });

  const updateHabit = useMutation({
    mutationFn: async (values: HabitFormValues & { id: number }) => {
      const { id, ...data } = values;
      return apiRequest("PUT", `/api/habits/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Habit updated",
        description: "Your habit has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to update habit",
        description: "There was an error updating your habit",
        variant: "destructive",
      });
    }
  });

  const deleteHabit = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/habits/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Habit deleted",
        description: "Your habit has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete habit",
        description: "There was an error deleting your habit",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: HabitFormValues) => {
    if (currentHabit) {
      updateHabit.mutate({ ...values, id: currentHabit.id });
    } else {
      createHabit.mutate(values);
    }
  };

  const handleNewHabit = () => {
    setCurrentHabit(null);
    form.reset({
      title: "",
      description: "",
      frequency: "daily",
      timeOfDay: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setCurrentHabit(habit);
    form.reset({
      title: habit.title,
      description: habit.description || "",
      frequency: habit.frequency,
      timeOfDay: habit.timeOfDay || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteHabit = (habit: Habit) => {
    setCurrentHabit(habit);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentHabit) {
      deleteHabit.mutate(currentHabit.id);
    }
  };

  const handleHabitToggle = (habitId: number, checked: boolean) => {
    // This is handled by the HabitItem component internally
    console.log(`Habit ${habitId} toggled: ${checked}`);
  };

  // Navigate between days
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Habits & Rituals</h1>
          <p className="text-sm text-slate-500">Track daily habits and build consistent routines</p>
        </div>
        <Button onClick={handleNewHabit}>
          <Plus className="mr-2 h-4 w-4" />
          New Habit
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 p-0" 
            onClick={goToPreviousDay}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm md:text-base font-medium text-slate-700">
            {format(currentDate, "MMMM d, yyyy")}
          </h2>
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 p-0" 
            onClick={goToNextDay}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="morning">Morning</TabsTrigger>
          <TabsTrigger value="evening">Evening</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary-600" />
                Daily Habits
              </CardTitle>
              <CardDescription>
                Track your habits for {format(currentDate, "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-3">
              {isLoadingHabits || isLoadingEntries ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-opacity-20 border-t-primary rounded-full"></div>
                </div>
              ) : filteredHabits.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-700 mb-1">No Habits Found</h3>
                  <p className="text-sm text-slate-500 mb-4">Create some habits to track your daily routines</p>
                  <Button onClick={handleNewHabit}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Habit
                  </Button>
                </div>
              ) : (
                <div>
                  {filteredHabits.map((habit: Habit) => {
                    const entry = habitEntries?.find((e: HabitEntry) => e.habitId === habit.id);
                    const isChecked = Boolean(entry);
                    const completedTime = entry?.completedAt ? 
                      format(new Date(entry.completedAt), "h:mm a") : undefined;
                    
                    return (
                      <div key={habit.id} className="group relative">
                        <HabitItem 
                          habit={habit} 
                          isChecked={isChecked} 
                          completedTime={completedTime}
                          onToggle={handleHabitToggle}
                        />
                        <div className="absolute top-2 right-2 hidden group-hover:flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => handleEditHabit(habit)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive" 
                            onClick={() => handleDeleteHabit(habit)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Rocket className="mr-2 h-5 w-5 text-primary-600" />
                Habit Stats
              </CardTitle>
              <CardDescription>
                Track your progress and streaks
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              {isLoadingHabits ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-opacity-20 border-t-primary rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-slate-500 mb-1">Habits</p>
                      <p className="text-xl font-bold text-slate-800">{habits.length}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-slate-500 mb-1">Completed Today</p>
                      <p className="text-xl font-bold text-slate-800">{habitEntries.length}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Top Streaks</h3>
                    <div className="space-y-3">
                      {habits.sort((a: Habit, b: Habit) => (b.streak || 0) - (a.streak || 0))
                        .slice(0, 3)
                        .map((habit: Habit) => (
                          <div key={habit.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-primary-600 mr-2"></div>
                              <span className="text-sm text-slate-700">{habit.title}</span>
                            </div>
                            <Badge variant="outline" className="bg-primary-50 text-primary-700">
                              {habit.streak} days
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Best Streaks Ever</h3>
                    <div className="space-y-3">
                      {habits.sort((a: Habit, b: Habit) => (b.bestStreak || 0) - (a.bestStreak || 0))
                        .slice(0, 3)
                        .map((habit: Habit) => (
                          <div key={habit.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-secondary-600 mr-2"></div>
                              <span className="text-sm text-slate-700">{habit.title}</span>
                            </div>
                            <Badge variant="outline" className="bg-secondary-50 text-secondary-700">
                              {habit.bestStreak} days
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-md mr-3">
                    <div className="text-primary-600 h-4 w-4">1</div>
                  </div>
                  <p className="text-sm text-slate-600">Start with just a few habits to avoid overwhelming yourself.</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-md mr-3">
                    <div className="text-primary-600 h-4 w-4">2</div>
                  </div>
                  <p className="text-sm text-slate-600">Stack new habits onto existing routines for better consistency.</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-md mr-3">
                    <div className="text-primary-600 h-4 w-4">3</div>
                  </div>
                  <p className="text-sm text-slate-600">If you miss a day, don't break the chain - just continue the next day.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New/Edit Habit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentHabit ? "Edit Habit" : "Create New Habit"}</DialogTitle>
            <DialogDescription>
              {currentHabit
                ? "Update your habit details below"
                : "Define a new habit to track regularly"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habit Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Morning Meditation" {...field} />
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
                        placeholder="Add more details about your habit..." 
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
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How often?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timeOfDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of Day (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                          <SelectItem value="anytime">Anytime</SelectItem>
                        </SelectContent>
                      </Select>
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
                  disabled={createHabit.isPending || updateHabit.isPending}
                >
                  {createHabit.isPending || updateHabit.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                      Saving...
                    </div>
                  ) : (
                    currentHabit ? "Update Habit" : "Create Habit"
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
              This will permanently delete the habit "{currentHabit?.title}" and all its tracking history. This action cannot be undone.
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
              disabled={deleteHabit.isPending}
            >
              {deleteHabit.isPending ? "Deleting..." : "Delete Habit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
