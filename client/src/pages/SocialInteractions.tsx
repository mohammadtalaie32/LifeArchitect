import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parseISO, addDays, set, isSameDay, isBefore } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Building,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  MapPin,
  MoreHorizontal,
  Plus,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/dateUtils";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function SocialInteractions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toast } = useToast();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events'],
  });

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startTime: new Date(),
      category: "social",
      icon: "users",
    }
  });

  const createEvent = useMutation({
    mutationFn: async (values: EventFormValues) => {
      return apiRequest("POST", "/api/events", values);
    },
    onSuccess: () => {
      toast({
        title: "Event created",
        description: "Your event has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create event",
        description: "There was an error creating your event",
        variant: "destructive",
      });
    }
  });

  const updateEvent = useMutation({
    mutationFn: async (values: EventFormValues & { id: number }) => {
      const { id, ...data } = values;
      return apiRequest("PUT", `/api/events/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Event updated",
        description: "Your event has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to update event",
        description: "There was an error updating your event",
        variant: "destructive",
      });
    }
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Event deleted",
        description: "Your event has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete event",
        description: "There was an error deleting your event",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: EventFormValues) => {
    if (currentEvent) {
      updateEvent.mutate({ ...values, id: currentEvent.id });
    } else {
      createEvent.mutate(values);
    }
  };

  const handleNewEvent = () => {
    setCurrentEvent(null);
    const initialStartTime = set(new Date(), { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
    const initialEndTime = addDays(initialStartTime, 0, { hours: 19, minutes: 0, seconds: 0, milliseconds: 0 });
    
    form.reset({
      title: "",
      description: "",
      location: "",
      startTime: initialStartTime,
      endTime: initialEndTime,
      category: "social",
      icon: "users",
    });
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setCurrentEvent(event);
    form.reset({
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      startTime: new Date(event.startTime),
      endTime: event.endTime ? new Date(event.endTime) : undefined,
      category: event.category || "social",
      icon: event.icon || "users",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = (event: any) => {
    setCurrentEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentEvent) {
      deleteEvent.mutate(currentEvent.id);
    }
  };

  // Navigate between days
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, -1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter events based on active tab and current date
  const filterEvents = () => {
    if (!events || events.length === 0) return [];
    
    const now = new Date();
    
    if (activeTab === "upcoming") {
      return events
        .filter((event: any) => {
          const eventDate = new Date(event.startTime);
          return isSameDay(eventDate, currentDate) || isBefore(now, eventDate);
        })
        .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    } else if (activeTab === "past") {
      return events
        .filter((event: any) => {
          const eventDate = new Date(event.startTime);
          return !isSameDay(eventDate, currentDate) && isBefore(eventDate, now);
        })
        .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    } else if (activeTab === "today") {
      return events
        .filter((event: any) => {
          const eventDate = new Date(event.startTime);
          return isSameDay(eventDate, currentDate);
        })
        .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    
    return events.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };
  
  const filteredEvents = filterEvents();

  // Get event icon component
  const getEventIcon = (icon: string, category: string) => {
    if (icon === "users" || category === "social") {
      return <Users className="h-5 w-5" />;
    } else if (icon === "building" || category === "wellness") {
      return <Building className="h-5 w-5" />;
    } else if (icon === "video" || category === "virtual") {
      return <Video className="h-5 w-5" />;
    } else {
      return <Users className="h-5 w-5" />;
    }
  };

  // Get icon background color class
  const getIconBgClass = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "learning":
        return "bg-primary-100";
      case "wellness":
        return "bg-secondary-100";
      case "virtual":
        return "bg-blue-100";
      case "social":
      default:
        return "bg-accent-100";
    }
  };

  // Get icon text color class
  const getIconTextClass = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "learning":
        return "text-primary-600";
      case "wellness":
        return "text-secondary-600";
      case "virtual":
        return "text-blue-600";
      case "social":
      default:
        return "text-accent-600";
    }
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Social Interactions</h1>
          <p className="text-sm text-slate-500">Schedule and track social events and community engagements</p>
        </div>
        <Button onClick={handleNewEvent}>
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
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
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {isLoading ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="animate-spin h-8 w-8 border-2 border-primary border-opacity-20 border-t-primary rounded-full mx-auto"></div>
            <p className="mt-4 text-slate-500">Loading events...</p>
          </CardContent>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-medium text-slate-700 mb-2">No Events Found</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              {activeTab === "upcoming"
                ? "Schedule some social events to keep track of your engagements."
                : activeTab === "today"
                ? "No events scheduled for today."
                : "No past events found in your history."}
            </p>
            <Button onClick={handleNewEvent}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule an Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredEvents.map((event: any) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div 
                  className={`${getIconBgClass(event.category)} p-6 flex items-center justify-center md:w-24`}
                >
                  <div className={getIconTextClass(event.category)}>
                    {getEventIcon(event.icon, event.category)}
                  </div>
                </div>
                <div className="flex-1">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <CardDescription>
                          {format(new Date(event.startTime), "EEEE, MMMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteEvent(event)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {event.description && (
                      <p className="text-slate-600 mb-4">{event.description}</p>
                    )}
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center text-sm text-slate-600">
                        <Clock className="mr-2 h-4 w-4 text-slate-500" />
                        <span>{format(new Date(event.startTime), "h:mm a")}</span>
                        {event.endTime && (
                          <>
                            <span className="mx-1">-</span>
                            <span>{format(new Date(event.endTime), "h:mm a")}</span>
                          </>
                        )}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="mr-2 h-4 w-4 text-slate-500" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex justify-between items-center w-full">
                      <Badge variant="outline" className={`${getIconBgClass(event.category)} ${getIconTextClass(event.category)}`}>
                        {event.category || "Social"}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {formatRelativeTime(new Date(event.startTime))}
                      </span>
                    </div>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* New/Edit Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>
              {currentEvent
                ? "Update your event details below"
                : "Schedule a new social event or interaction"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Coffee with Michael" {...field} />
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
                        placeholder="Add more details about your event..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Downtown Coffee Shop" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date & Time</FormLabel>
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
                                format(field.value, "PPP p")
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
                            onSelect={(date) => {
                              if (date) {
                                const hours = field.value.getHours();
                                const minutes = field.value.getMinutes();
                                const newDate = new Date(date);
                                newDate.setHours(hours, minutes, 0, 0);
                                field.onChange(newDate);
                              }
                            }}
                            initialFocus
                          />
                          <div className="p-3 border-t border-slate-200">
                            <Input
                              type="time"
                              value={format(field.value, "HH:mm")}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(field.value);
                                newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                field.onChange(newDate);
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Time (Optional)</FormLabel>
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
                                format(field.value, "PPP p")
                              ) : (
                                <span>Pick end time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || form.watch('startTime')}
                            onSelect={(date) => {
                              if (date) {
                                const hours = field.value ? field.value.getHours() : (form.watch('startTime').getHours() + 1);
                                const minutes = field.value ? field.value.getMinutes() : form.watch('startTime').getMinutes();
                                const newDate = new Date(date);
                                newDate.setHours(hours, minutes, 0, 0);
                                field.onChange(newDate);
                              }
                            }}
                            initialFocus
                          />
                          <div className="p-3 border-t border-slate-200">
                            <Input
                              type="time"
                              value={field.value ? format(field.value, "HH:mm") : ""}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(field.value || form.watch('startTime'));
                                newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                field.onChange(newDate);
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
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
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="wellness">Wellness</SelectItem>
                          <SelectItem value="learning">Learning</SelectItem>
                          <SelectItem value="virtual">Virtual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="users">
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" />
                              <span>People</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="building">
                            <div className="flex items-center">
                              <Building className="mr-2 h-4 w-4" />
                              <span>Venue</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="video">
                            <div className="flex items-center">
                              <Video className="mr-2 h-4 w-4" />
                              <span>Virtual</span>
                            </div>
                          </SelectItem>
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
                  disabled={createEvent.isPending || updateEvent.isPending}
                >
                  {createEvent.isPending || updateEvent.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                      Saving...
                    </div>
                  ) : (
                    currentEvent ? "Update Event" : "Create Event"
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
              This will permanently delete the event "{currentEvent?.title}". This action cannot be undone.
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
              disabled={deleteEvent.isPending}
            >
              {deleteEvent.isPending ? "Deleting..." : "Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
