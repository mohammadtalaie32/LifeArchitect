import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Check, Edit, Edit3, Plus, Trash2 } from "lucide-react";

const journalEntrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  mood: z.string().min(1, "Mood is required"),
  tags: z.array(z.string()).optional(),
});

type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;

export default function SelfAnalysis() {
  const [activeTab, setActiveTab] = useState("journal");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any | null>(null);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();

  const { data: journalEntries = [], isLoading: isLoadingEntries } = useQuery({
    queryKey: ['/api/journal-entries'],
  });

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      title: "",
      content: "",
      mood: "positive",
      tags: [],
    }
  });

  const createJournalEntry = useMutation({
    mutationFn: async (values: JournalEntryFormValues) => {
      return apiRequest("POST", "/api/journal-entries", values);
    },
    onSuccess: () => {
      toast({
        title: "Journal entry created",
        description: "Your journal entry has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create journal entry",
        description: "There was an error creating your journal entry",
        variant: "destructive",
      });
    }
  });

  const updateJournalEntry = useMutation({
    mutationFn: async (values: JournalEntryFormValues & { id: number }) => {
      const { id, ...data } = values;
      return apiRequest("PUT", `/api/journal-entries/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Journal entry updated",
        description: "Your journal entry has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to update journal entry",
        description: "There was an error updating your journal entry",
        variant: "destructive",
      });
    }
  });

  const deleteJournalEntry = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/journal-entries/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Journal entry deleted",
        description: "Your journal entry has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete journal entry",
        description: "There was an error deleting your journal entry",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: JournalEntryFormValues) => {
    if (currentEntry) {
      updateJournalEntry.mutate({ ...values, id: currentEntry.id });
    } else {
      createJournalEntry.mutate(values);
    }
  };

  const handleNewEntry = () => {
    setCurrentEntry(null);
    form.reset({
      title: "",
      content: "",
      mood: "positive",
      tags: [],
    });
    setIsDialogOpen(true);
  };

  const handleEditEntry = (entry: any) => {
    setCurrentEntry(entry);
    form.reset({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || "neutral",
      tags: entry.tags || [],
    });
    setIsDialogOpen(true);
  };

  const handleDeleteEntry = (entry: any) => {
    setCurrentEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentEntry) {
      deleteJournalEntry.mutate(currentEntry.id);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.getValues("tags")?.includes(tagInput.trim())) {
      const currentTags = form.getValues("tags") || [];
      form.setValue("tags", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter((t) => t !== tag));
  };

  const getBadgeColors = (tag: string) => {
    const tagLower = tag.toLowerCase();
    
    if (tagLower.includes("reflection")) {
      return "bg-primary-100 text-primary-800";
    } else if (tagLower.includes("coding") || tagLower.includes("learning")) {
      return "bg-secondary-100 text-secondary-800";
    } else if (tagLower.includes("wellness")) {
      return "bg-slate-100 text-slate-800";
    } else if (tagLower.includes("achievement")) {
      return "bg-accent-100 text-accent-800";
    } else if (tagLower.includes("sobriety")) {
      return "bg-blue-100 text-blue-800";
    } else {
      return "bg-slate-100 text-slate-800";
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case "positive":
        return "😊";
      case "negative":
        return "😔";
      case "neutral":
        return "😐";
      default:
        return "😐";
    }
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Self-Analysis</h1>
          <p className="text-sm text-slate-500">Explore your thoughts, feelings, and behavioral patterns</p>
        </div>
        <Button onClick={handleNewEntry}>
          <Plus className="mr-2 h-4 w-4" />
          New Journal Entry
        </Button>
      </div>
      
      <Tabs defaultValue="journal" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral Analysis</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Recognition</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <TabsContent value="journal" className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {isLoadingEntries ? (
            <Card className="text-center py-8">
              <CardContent>
                <div className="animate-spin h-8 w-8 border-2 border-primary border-opacity-20 border-t-primary rounded-full mx-auto"></div>
                <p className="mt-4 text-slate-500">Loading journal entries...</p>
              </CardContent>
            </Card>
          ) : journalEntries.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Edit3 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-700 mb-2">No Journal Entries Yet</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                  Start journaling to track your thoughts, feelings, and experiences.
                </p>
                <Button onClick={handleNewEntry}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            journalEntries.map((entry: any) => (
              <Card key={entry.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl flex items-center">
                      {entry.title}
                      <span className="ml-2 text-2xl" aria-label={`Mood: ${entry.mood}`}>
                        {getMoodEmoji(entry.mood)}
                      </span>
                    </CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditEntry(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteEntry(entry)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {entry.createdAt && formatDate(entry.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-slate-600 whitespace-pre-line mb-4">{entry.content}</p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag: string, idx: number) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className={getBadgeColors(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="behavioral" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Behavioral Analysis</CardTitle>
            <CardDescription>
              Analyze your behavioral patterns and emotional responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-3">Thought Patterns</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-4">
                    Use this space to analyze recurring thought patterns and cognitive distortions.
                  </p>
                  <Textarea 
                    placeholder="What repetitive thoughts have you noticed today? What triggers them?"
                    className="min-h-[100px]"
                  />
                  <Button className="mt-3">Save Analysis</Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-3">Emotional Responses</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-4">
                    Document your emotional reactions to different situations.
                  </p>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">Situation:</label>
                      <Input placeholder="Describe the situation that triggered an emotional response" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">Emotion:</label>
                      <Input placeholder="What emotion(s) did you feel?" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">Intensity (1-10):</label>
                      <Input type="number" min="1" max="10" placeholder="Rate the intensity" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">Thoughts:</label>
                      <Textarea placeholder="What thoughts went through your mind?" />
                    </div>
                    <Button>Record Response</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="patterns" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pattern Recognition</CardTitle>
            <CardDescription>
              Identify recurring themes and patterns in your thoughts and behaviors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-3">Journal Insights</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-4">
                    Based on your journal entries, here are some recurring themes:
                  </p>
                  {journalEntries.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded border border-slate-200">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-primary-600 mr-2"></div>
                          <span className="text-sm font-medium text-slate-700">Productivity Concerns</span>
                        </div>
                        <Badge className="bg-primary-50 text-primary-700">7 mentions</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border border-slate-200">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-secondary-600 mr-2"></div>
                          <span className="text-sm font-medium text-slate-700">Social Anxiety</span>
                        </div>
                        <Badge className="bg-secondary-50 text-secondary-700">5 mentions</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border border-slate-200">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-accent-600 mr-2"></div>
                          <span className="text-sm font-medium text-slate-700">Sobriety Challenges</span>
                        </div>
                        <Badge className="bg-accent-50 text-accent-700">3 mentions</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-500">No journal entries yet to analyze patterns.</p>
                      <Button 
                        variant="outline" 
                        className="mt-3"
                        onClick={handleNewEntry}
                      >
                        Create Journal Entry
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-3">Mood Correlations</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-4">
                    Factors that appear to influence your mood:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Sleep Quality</span>
                      <div className="flex items-center">
                        <span className="text-sm text-slate-700 mr-2">Positive Impact</span>
                        <div className="bg-green-500 h-2 w-20 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Exercise</span>
                      <div className="flex items-center">
                        <span className="text-sm text-slate-700 mr-2">Positive Impact</span>
                        <div className="bg-green-500 h-2 w-16 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Work Pressure</span>
                      <div className="flex items-center">
                        <span className="text-sm text-slate-700 mr-2">Negative Impact</span>
                        <div className="bg-red-500 h-2 w-14 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Social Interaction</span>
                      <div className="flex items-center">
                        <span className="text-sm text-slate-700 mr-2">Varies</span>
                        <div className="bg-amber-500 h-2 w-10 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* New/Edit Journal Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentEntry ? "Edit Journal Entry" : "New Journal Entry"}</DialogTitle>
            <DialogDescription>
              {currentEntry
                ? "Update your journal entry below"
                : "Document your thoughts, feelings, and experiences"}
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
                      <Input placeholder="e.g., Morning Reflection" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your thoughts here..." 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How are you feeling?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="positive">Positive 😊</SelectItem>
                        <SelectItem value="neutral">Neutral 😐</SelectItem>
                        <SelectItem value="negative">Negative 😔</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={() => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.watch("tags")?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag (e.g., Reflection, Learning)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                    </div>
                    <FormDescription>
                      Press Enter or click Add to add a tag
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                  disabled={createJournalEntry.isPending || updateJournalEntry.isPending}
                >
                  {createJournalEntry.isPending || updateJournalEntry.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                      Saving...
                    </div>
                  ) : (
                    currentEntry ? "Update Entry" : "Save Entry"
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
              This will permanently delete the journal entry "{currentEntry?.title}". This action cannot be undone.
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
              disabled={deleteJournalEntry.isPending}
            >
              {deleteJournalEntry.isPending ? "Deleting..." : "Delete Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
