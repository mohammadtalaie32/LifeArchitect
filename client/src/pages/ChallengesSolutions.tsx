import { useState } from "react";
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
import {
  AlertCircle,
  CheckCircle,
  Lightbulb,
  MoreHorizontal,
  PlusCircle,
  ThumbsUp,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Since the API for challenges/solutions isn't fully implemented yet,
// we'll create a simple data structure to simulate functionality
type ChallengeType = "addiction" | "anxiety" | "productivity" | "social" | "other";
type SolutionStatus = "tried" | "considering" | "effective" | "ineffective";

interface Solution {
  id: number;
  description: string;
  status: SolutionStatus;
  dateAdded: Date;
  notes?: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: ChallengeType;
  dateAdded: Date;
  solutions: Solution[];
}

// Sample challenges data
const initialChallenges: Challenge[] = [
  {
    id: 1,
    title: "Managing social anxiety at networking events",
    description: "I struggle with initiating conversations and maintaining them at professional networking events, which is affecting my career growth opportunities.",
    type: "social",
    dateAdded: new Date(2023, 5, 15),
    solutions: [
      {
        id: 1,
        description: "Prepare 3-5 conversation starters before attending events",
        status: "effective",
        dateAdded: new Date(2023, 5, 16),
        notes: "This has been helping a lot. Having prepared questions reduces the anxiety of not knowing what to say."
      },
      {
        id: 2,
        description: "Practice small talk with friends or in low-pressure situations",
        status: "considering",
        dateAdded: new Date(2023, 5, 16)
      },
      {
        id: 3,
        description: "Take a public speaking course to build confidence",
        status: "tried",
        dateAdded: new Date(2023, 5, 20),
        notes: "Attended one session. Need to continue to see results."
      }
    ]
  },
  {
    id: 2,
    title: "Managing triggers that lead to cravings",
    description: "Certain situations, people, or emotions trigger strong cravings that threaten my sobriety journey.",
    type: "addiction",
    dateAdded: new Date(2023, 6, 2),
    solutions: [
      {
        id: 4,
        description: "Use breathing techniques when cravings arise (4-7-8 method)",
        status: "effective",
        dateAdded: new Date(2023, 6, 3),
        notes: "This helps calm the immediate urge and gives me time to think clearly."
      },
      {
        id: 5,
        description: "Maintain a craving journal to identify patterns",
        status: "tried",
        dateAdded: new Date(2023, 6, 5),
        notes: "Starting to see patterns around stress at work."
      }
    ]
  },
  {
    id: 3,
    title: "Procrastination on coding projects",
    description: "I tend to put off starting or continuing coding projects, especially when I encounter challenging problems.",
    type: "productivity",
    dateAdded: new Date(2023, 6, 10),
    solutions: [
      {
        id: 6,
        description: "Break down projects into smaller, manageable tasks",
        status: "effective",
        dateAdded: new Date(2023, 6, 11),
        notes: "This makes the work feel less overwhelming."
      },
      {
        id: 7,
        description: "Use the Pomodoro technique (25 min work, 5 min break)",
        status: "effective",
        dateAdded: new Date(2023, 6, 12),
        notes: "Helps maintain focus for shorter periods."
      },
      {
        id: 8,
        description: "Set up accountability check-ins with a coding buddy",
        status: "considering",
        dateAdded: new Date(2023, 6, 15)
      }
    ]
  }
];

export default function ChallengesSolutions() {
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isNewChallengeDialogOpen, setIsNewChallengeDialogOpen] = useState(false);
  const [isNewSolutionDialogOpen, setIsNewSolutionDialogOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    type: "other" as ChallengeType
  });
  const [newSolution, setNewSolution] = useState({
    description: "",
    notes: ""
  });

  // Filter challenges based on active tab
  const filteredChallenges = activeTab === "all"
    ? challenges
    : challenges.filter(challenge => challenge.type === activeTab);

  const handleCreateChallenge = () => {
    const challenge: Challenge = {
      id: Math.max(0, ...challenges.map(c => c.id)) + 1,
      title: newChallenge.title,
      description: newChallenge.description,
      type: newChallenge.type,
      dateAdded: new Date(),
      solutions: []
    };

    setChallenges([...challenges, challenge]);
    setIsNewChallengeDialogOpen(false);
    setNewChallenge({ title: "", description: "", type: "other" });
  };

  const handleCreateSolution = () => {
    if (!selectedChallenge) return;

    const solution: Solution = {
      id: Math.max(0, ...selectedChallenge.solutions.map(s => s.id), ...challenges.flatMap(c => c.solutions.map(s => s.id))) + 1,
      description: newSolution.description,
      notes: newSolution.notes || undefined,
      status: "considering",
      dateAdded: new Date()
    };

    const updatedChallenge = {
      ...selectedChallenge,
      solutions: [...selectedChallenge.solutions, solution]
    };

    setChallenges(challenges.map(c => c.id === selectedChallenge.id ? updatedChallenge : c));
    setSelectedChallenge(updatedChallenge);
    setIsNewSolutionDialogOpen(false);
    setNewSolution({ description: "", notes: "" });
  };

  const handleUpdateSolutionStatus = (challengeId: number, solutionId: number, newStatus: SolutionStatus) => {
    const updatedChallenges = challenges.map(challenge => {
      if (challenge.id === challengeId) {
        const updatedSolutions = challenge.solutions.map(solution => {
          if (solution.id === solutionId) {
            return { ...solution, status: newStatus };
          }
          return solution;
        });
        
        const updatedChallenge = { ...challenge, solutions: updatedSolutions };
        
        if (selectedChallenge?.id === challengeId) {
          setSelectedChallenge(updatedChallenge);
        }
        
        return updatedChallenge;
      }
      return challenge;
    });
    
    setChallenges(updatedChallenges);
  };

  const getStatusBadge = (status: SolutionStatus) => {
    switch (status) {
      case "effective":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Effective</Badge>;
      case "ineffective":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Ineffective</Badge>;
      case "tried":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Tried</Badge>;
      case "considering":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Considering</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: ChallengeType) => {
    switch (type) {
      case "addiction":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Addiction Recovery</Badge>;
      case "anxiety":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Anxiety</Badge>;
      case "productivity":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Productivity</Badge>;
      case "social":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Social</Badge>;
      case "other":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Other</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Challenges & Solutions</h1>
          <p className="text-sm text-slate-500">Identify obstacles and develop strategies to overcome them</p>
        </div>
        <Button onClick={() => setIsNewChallengeDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Challenge
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="addiction">Addiction</TabsTrigger>
          <TabsTrigger value="anxiety">Anxiety</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-primary-600" />
                My Challenges
              </CardTitle>
              <CardDescription>
                Issues you're working to overcome
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              <div className="max-h-[70vh] overflow-y-auto">
                {filteredChallenges.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <AlertCircle className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-lg font-medium text-slate-700 mb-1">No Challenges Found</h3>
                    <p className="text-sm text-slate-500 mb-4">Add your first challenge to start tracking solutions</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsNewChallengeDialogOpen(true)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Challenge
                    </Button>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-200">
                    {filteredChallenges.map((challenge) => (
                      <li 
                        key={challenge.id} 
                        className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedChallenge?.id === challenge.id ? 'bg-slate-50' : ''}`}
                        onClick={() => setSelectedChallenge(challenge)}
                      >
                        <h3 className="font-medium text-slate-800 mb-1">{challenge.title}</h3>
                        <div className="flex items-center justify-between">
                          <div className="mt-1">
                            {getTypeIcon(challenge.type)}
                          </div>
                          <span className="text-xs text-slate-500">
                            {formatDate(challenge.dateAdded)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedChallenge ? (
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedChallenge.title}</CardTitle>
                    <div className="mt-2 flex items-center space-x-2">
                      {getTypeIcon(selectedChallenge.type)}
                      <span className="text-xs text-slate-500">
                        Added on {formatDate(selectedChallenge.dateAdded)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedChallenge(null)}
                    aria-label="Close challenge details"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-slate-600 mb-6 whitespace-pre-line">
                  {selectedChallenge.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-800">Solutions</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsNewSolutionDialogOpen(true)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Solution
                    </Button>
                  </div>
                  
                  {selectedChallenge.solutions.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                      <Lightbulb className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                      <h3 className="text-lg font-medium text-slate-700 mb-1">No Solutions Yet</h3>
                      <p className="text-sm text-slate-500 mb-4">Add potential solutions to address this challenge</p>
                      <Button
                        variant="outline"
                        onClick={() => setIsNewSolutionDialogOpen(true)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add First Solution
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedChallenge.solutions.map((solution) => (
                        <div 
                          key={solution.id} 
                          className="bg-white rounded-lg border border-slate-200 p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-slate-800 font-medium">{solution.description}</p>
                              {solution.notes && (
                                <p className="text-sm text-slate-600 mt-2">{solution.notes}</p>
                              )}
                              <div className="mt-3 flex items-center justify-between">
                                {getStatusBadge(solution.status)}
                                <span className="text-xs text-slate-500">
                                  Added: {formatDate(solution.dateAdded)}
                                </span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateSolutionStatus(selectedChallenge.id, solution.id, "effective")}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark as Effective
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateSolutionStatus(selectedChallenge.id, solution.id, "ineffective")}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Mark as Ineffective
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateSolutionStatus(selectedChallenge.id, solution.id, "tried")}
                                  className="text-blue-600"
                                >
                                  <ThumbsUp className="mr-2 h-4 w-4" />
                                  Mark as Tried
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateSolutionStatus(selectedChallenge.id, solution.id, "considering")}
                                  className="text-amber-600"
                                >
                                  <Lightbulb className="mr-2 h-4 w-4" />
                                  Mark as Considering
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Lightbulb className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-700 mb-2">Select a Challenge</h3>
                <p className="text-slate-500 max-w-md">
                  Choose a challenge from the list to view its details and solutions, or create a new one to start tracking
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Challenge Dialog */}
      <Dialog open={isNewChallengeDialogOpen} onOpenChange={setIsNewChallengeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Challenge</DialogTitle>
            <DialogDescription>
              Describe a challenge you're facing that you want to work on
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                placeholder="E.g., Managing social anxiety at events"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Type</label>
              <select
                id="type"
                className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm"
                value={newChallenge.type}
                onChange={(e) => setNewChallenge({ ...newChallenge, type: e.target.value as ChallengeType })}
              >
                <option value="addiction">Addiction Recovery</option>
                <option value="anxiety">Anxiety</option>
                <option value="productivity">Productivity</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                placeholder="Describe your challenge in detail..."
                className="min-h-[100px]"
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewChallengeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChallenge}
              disabled={!newChallenge.title || !newChallenge.description}
            >
              Add Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Solution Dialog */}
      <Dialog open={isNewSolutionDialogOpen} onOpenChange={setIsNewSolutionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Solution</DialogTitle>
            <DialogDescription>
              Propose a solution to address your challenge
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="solution" className="text-sm font-medium">Solution</label>
              <Input
                id="solution"
                placeholder="E.g., Practice deep breathing when anxiety hits"
                value={newSolution.description}
                onChange={(e) => setNewSolution({ ...newSolution, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                id="notes"
                placeholder="Any additional details or context..."
                className="min-h-[100px]"
                value={newSolution.notes}
                onChange={(e) => setNewSolution({ ...newSolution, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewSolutionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSolution}
              disabled={!newSolution.description}
            >
              Add Solution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
