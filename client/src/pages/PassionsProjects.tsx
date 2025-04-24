import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";
import { format, parseISO } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart2, 
  CalendarIcon, 
  Code, 
  Edit, 
  FilePen, 
  Hammer, 
  Lightbulb, 
  Palette, 
  Plus, 
  Trash2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.string().min(1, "Status is required"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function PassionsProjects() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Filter projects based on active tab
  const filteredProjects = activeTab === "all" 
    ? projects 
    : projects.filter((project: Project) => project.status === activeTab);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      status: "active",
    }
  });

  const createProject = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      return apiRequest("POST", "/api/projects", values);
    },
    onSuccess: () => {
      toast({
        title: "Project created",
        description: "Your project has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create project",
        description: "There was an error creating your project",
        variant: "destructive",
      });
    }
  });

  const updateProject = useMutation({
    mutationFn: async (values: ProjectFormValues & { id: number }) => {
      const { id, ...data } = values;
      return apiRequest("PUT", `/api/projects/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Project updated",
        description: "Your project has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to update project",
        description: "There was an error updating your project",
        variant: "destructive",
      });
    }
  });

  const deleteProject = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete project",
        description: "There was an error deleting your project",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: ProjectFormValues) => {
    if (currentProject) {
      updateProject.mutate({ ...values, id: currentProject.id });
    } else {
      createProject.mutate(values);
    }
  };

  const handleNewProject = () => {
    setCurrentProject(null);
    form.reset({
      title: "",
      description: "",
      category: "",
      status: "active",
      startDate: new Date(),
    });
    setIsDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    form.reset({
      title: project.title,
      description: project.description || "",
      category: project.category || "",
      status: project.status || "active",
      startDate: project.startDate ? new Date(project.startDate) : undefined,
      endDate: project.endDate ? new Date(project.endDate) : undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setCurrentProject(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentProject) {
      deleteProject.mutate(currentProject.id);
    }
  };

  // Get icon for project category
  const getCategoryIcon = (category?: string) => {
    if (!category) return <Lightbulb className="h-5 w-5" />;

    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes("coding") || lowerCategory.includes("programming")) {
      return <Code className="h-5 w-5" />;
    } else if (lowerCategory.includes("writing") || lowerCategory.includes("blog")) {
      return <FilePen className="h-5 w-5" />;
    } else if (lowerCategory.includes("art") || lowerCategory.includes("design")) {
      return <Palette className="h-5 w-5" />;
    } else if (lowerCategory.includes("craft") || lowerCategory.includes("build")) {
      return <Hammer className="h-5 w-5" />;
    } else {
      return <Lightbulb className="h-5 w-5" />;
    }
  };

  // Get badge color for project status
  const getStatusBadgeClass = (status?: string) => {
    if (!status) return "bg-slate-100 text-slate-800";

    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "active") return "bg-green-100 text-green-800";
    if (lowerStatus === "planned") return "bg-blue-100 text-blue-800";
    if (lowerStatus === "completed") return "bg-purple-100 text-purple-800";
    if (lowerStatus === "paused") return "bg-amber-100 text-amber-800";
    if (lowerStatus === "abandoned") return "bg-red-100 text-red-800";

    return "bg-slate-100 text-slate-800";
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Passions & Projects</h1>
          <p className="text-sm text-slate-500">Explore and document your creative outlets and meaningful pursuits</p>
        </div>
        <Button onClick={handleNewProject}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-opacity-20 border-t-primary rounded-full"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-medium text-slate-700 mb-2">
              No Projects Found
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              {activeTab === "all"
                ? "Create some projects to document your passions and interests."
                : `No ${activeTab} projects found. Start by creating a new project.`}
            </p>
            <Button onClick={handleNewProject}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: Project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center">
                    {getCategoryIcon(project.category)}
                    <span className="ml-2">{project.title}</span>
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteProject(project)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.category && (
                    <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                      {project.category}
                    </Badge>
                  )}
                  {project.status && (
                    <Badge variant="outline" className={getStatusBadgeClass(project.status)}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  )}
                </div>
                {project.description && (
                  <CardDescription className="mt-2">
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2 text-sm">
                  {project.startDate && (
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">
                        Started: {format(new Date(project.startDate), "MMMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  {project.endDate && (
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">
                        Ended: {format(new Date(project.endDate), "MMMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="pt-3">
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs text-slate-500">
                    Created: {format(new Date(project.createdAt!), "MMM d, yyyy")}
                  </span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* New/Edit Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentProject ? "Edit Project" : "Create New Project"}</DialogTitle>
            <DialogDescription>
              {currentProject
                ? "Update your project details below"
                : "Document a new passion or creative project"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Personal Website Redesign" {...field} />
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
                        placeholder="Add more details about your project..." 
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
                          <SelectItem value="Coding">Coding</SelectItem>
                          <SelectItem value="Writing">Writing</SelectItem>
                          <SelectItem value="Art">Art</SelectItem>
                          <SelectItem value="Music">Music</SelectItem>
                          <SelectItem value="Craft">Craft</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="abandoned">Abandoned</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date (Optional)</FormLabel>
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch('status') === 'completed' && (
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
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
                  disabled={createProject.isPending || updateProject.isPending}
                >
                  {createProject.isPending || updateProject.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                      Saving...
                    </div>
                  ) : (
                    currentProject ? "Update Project" : "Create Project"
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
              This will permanently delete the project "{currentProject?.title}". This action cannot be undone.
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
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
