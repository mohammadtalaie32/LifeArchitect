import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Principle } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Edit, Trash2 } from "lucide-react";

const principleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid color is required"),
  order: z.number(),
});

type PrincipleFormValues = z.infer<typeof principleFormSchema>;

export default function CorePrinciples() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPrinciple, setSelectedPrinciple] = useState<Principle | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: principles = [], isLoading } = useQuery({
    queryKey: ['/api/principles'],
  });

  const form = useForm<PrincipleFormValues>({
    resolver: zodResolver(principleFormSchema),
    defaultValues: {
      title: "",
      description: "",
      color: "#4F46E5",
      order: 0,
    }
  });

  const createPrinciple = useMutation({
    mutationFn: async (values: PrincipleFormValues) => {
      return apiRequest("POST", "/api/principles", values);
    },
    onSuccess: () => {
      toast({
        title: "Principle created",
        description: "Your principle has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/principles'] });
      form.reset();
      setIsEditMode(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create principle",
        description: "There was an error creating your principle",
        variant: "destructive",
      });
    }
  });

  const updatePrinciple = useMutation({
    mutationFn: async (values: PrincipleFormValues & { id: number }) => {
      const { id, ...data } = values;
      return apiRequest("PUT", `/api/principles/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Principle updated",
        description: "Your principle has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/principles'] });
      form.reset();
      setIsEditMode(false);
      setSelectedPrinciple(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update principle",
        description: "There was an error updating your principle",
        variant: "destructive",
      });
    }
  });

  const deletePrinciple = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/principles/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Principle deleted",
        description: "Your principle has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/principles'] });
      setIsDeleteDialogOpen(false);
      setSelectedPrinciple(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete principle",
        description: "There was an error deleting your principle",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: PrincipleFormValues) => {
    if (selectedPrinciple) {
      updatePrinciple.mutate({ ...values, id: selectedPrinciple.id });
    } else {
      // Set the order to be the next available order
      const nextOrder = principles.length > 0 
        ? Math.max(...principles.map((p: Principle) => p.order)) + 1 
        : 1;
      
      createPrinciple.mutate({ ...values, order: nextOrder });
    }
  };

  const handleEdit = (principle: Principle) => {
    setSelectedPrinciple(principle);
    form.reset({
      title: principle.title,
      description: principle.description,
      color: principle.color,
      order: principle.order,
    });
    setIsEditMode(true);
  };

  const handleDelete = (principle: Principle) => {
    setSelectedPrinciple(principle);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPrinciple) {
      deletePrinciple.mutate(selectedPrinciple.id);
    }
  };

  const cancelEdit = () => {
    form.reset();
    setIsEditMode(false);
    setSelectedPrinciple(null);
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Core Principles</h1>
        <p className="text-sm text-slate-500">Define and reflect on the principles that guide your life and actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
                My Core Principles
              </CardTitle>
              <CardDescription>
                These principles form the foundation of your decisions and actions
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-opacity-20 border-t-primary rounded-full"></div>
                </div>
              ) : principles.length === 0 ? (
                <div className="text-center py-6">
                  <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-700 mb-1">No Principles Defined</h3>
                  <p className="text-sm text-slate-500 mb-4">Define your core principles to guide your journey</p>
                  <Button onClick={() => setIsEditMode(true)}>Define Principles</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {principles.map((principle: Principle) => (
                    <div key={principle.id} className="border border-slate-200 rounded-lg p-4 relative">
                      <div 
                        className="h-3 w-full absolute top-0 left-0 right-0 rounded-t-lg" 
                        style={{ backgroundColor: principle.color }}
                      ></div>
                      <div className="pt-3">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-slate-800">{principle.title}</h3>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(principle)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(principle)}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{principle.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {principles.length > 0 && (
              <CardFooter className="flex justify-center border-t pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditMode(true)}
                >
                  Add New Principle
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {isEditMode && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedPrinciple ? "Edit Principle" : "New Principle"}
                </CardTitle>
                <CardDescription>
                  {selectedPrinciple
                    ? "Update your core principle"
                    : "Define a new principle that guides your life"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Pursuing Passion" {...field} />
                          </FormControl>
                          <FormDescription>
                            A short, memorable title for your principle
                          </FormDescription>
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
                            <Textarea 
                              placeholder="e.g., Engage daily in activities that fuel creativity and purpose" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            A clear description of what this principle means to you
                          </FormDescription>
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
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-8 h-8 rounded-full border border-slate-200" 
                              style={{ backgroundColor: field.value }}
                            ></div>
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Choose a color that represents this principle
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createPrinciple.isPending || updatePrinciple.isPending}
                      >
                        {createPrinciple.isPending || updatePrinciple.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                            Saving...
                          </div>
                        ) : (
                          selectedPrinciple ? "Update Principle" : "Save Principle"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

        {!isEditMode && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Reflection Journal</CardTitle>
                <CardDescription>
                  Reflect on how your actions align with your core principles
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Daily Reflection</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Take a moment to consider how your actions today aligned with your core principles.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Which principle did you honor today?</label>
                        <select className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm">
                          <option value="">Select a principle...</option>
                          {principles.map((principle: Principle) => (
                            <option key={principle.id} value={principle.id}>{principle.title}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">How did your actions align with this principle?</label>
                        <Textarea 
                          placeholder="Describe the specific actions or decisions..." 
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <Button className="w-full">Save Reflection</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the principle "{selectedPrinciple?.title}". This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deletePrinciple.isPending}
            >
              {deletePrinciple.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
