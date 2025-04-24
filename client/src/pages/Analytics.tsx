import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, addDays, startOfMonth, endOfMonth } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  PieChart as PieChartIcon,
  BarChart2,
  TrendingUp,
} from "lucide-react";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("week");
  const [activeTab, setActiveTab] = useState("habits");
  
  // Calculate date range
  const today = new Date();
  const getDateRange = () => {
    switch(dateRange) {
      case "week":
        return { start: subDays(today, 6), end: today };
      case "month":
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case "90days":
        return { start: subDays(today, 89), end: today };
      default:
        return { start: subDays(today, 6), end: today };
    }
  };
  
  const { start, end } = getDateRange();
  
  // Fetch habit entries
  const { data: habitEntries = [], isLoading: isLoadingHabits } = useQuery({
    queryKey: ['/api/habit-entries', start.toISOString(), end.toISOString()],
  });
  
  // Fetch habits
  const { data: habits = [], isLoading: isLoadingHabitsList } = useQuery({
    queryKey: ['/api/habits'],
  });
  
  // Fetch mood entries
  const { data: moodEntries = [], isLoading: isLoadingMoods } = useQuery({
    queryKey: ['/api/mood-entries', start.toISOString(), end.toISOString()],
  });
  
  // Fetch goals
  const { data: goals = [], isLoading: isLoadingGoals } = useQuery({
    queryKey: ['/api/goals'],
  });
  
  // Generate habit completion data for chart
  const generateHabitCompletionData = () => {
    if (isLoadingHabits || isLoadingHabitsList) return [];
    
    const dates = [];
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return dates.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      const entriesForDay = habitEntries.filter((entry: any) => {
        const entryDate = new Date(entry.completedAt);
        return format(entryDate, "yyyy-MM-dd") === dateStr;
      });
      
      return {
        date: format(date, "MMM dd"),
        completed: entriesForDay.length,
        total: habits.length,
        completionRate: habits.length > 0 ? Math.round((entriesForDay.length / habits.length) * 100) : 0
      };
    });
  };
  
  // Generate mood data for chart
  const generateMoodData = () => {
    if (isLoadingMoods) return [];
    
    const dates = [];
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return dates.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      const moodForDay = moodEntries.find((entry: any) => {
        const entryDate = new Date(entry.createdAt);
        return format(entryDate, "yyyy-MM-dd") === dateStr;
      });
      
      let moodScore = 3; // neutral default
      
      if (moodForDay) {
        if (moodForDay.mood === "positive") {
          moodScore = moodForDay.intensityLevel || 4;
        } else if (moodForDay.mood === "negative") {
          moodScore = moodForDay.intensityLevel ? 6 - moodForDay.intensityLevel : 2;
        } else {
          moodScore = 3;
        }
      }
      
      return {
        date: format(date, "MMM dd"),
        mood: moodScore
      };
    });
  };
  
  // Generate goal progress data
  const generateGoalProgressData = () => {
    if (isLoadingGoals) return [];
    
    const completedGoals = goals.filter((goal: any) => goal.completed);
    const activeGoals = goals.filter((goal: any) => !goal.completed);
    
    const activeGoalsByProgress = [
      { name: "0-25%", value: 0 },
      { name: "26-50%", value: 0 },
      { name: "51-75%", value: 0 },
      { name: "76-99%", value: 0 },
    ];
    
    activeGoals.forEach((goal: any) => {
      const progressPercentage = (goal.progress / goal.totalSteps) * 100;
      
      if (progressPercentage < 26) {
        activeGoalsByProgress[0].value++;
      } else if (progressPercentage < 51) {
        activeGoalsByProgress[1].value++;
      } else if (progressPercentage < 76) {
        activeGoalsByProgress[2].value++;
      } else {
        activeGoalsByProgress[3].value++;
      }
    });
    
    return {
      goalsData: [
        { name: "Completed", value: completedGoals.length },
        { name: "Active", value: activeGoals.length }
      ],
      progressData: activeGoalsByProgress.filter(item => item.value > 0)
    };
  };
  
  // Prepare chart data
  const habitCompletionData = generateHabitCompletionData();
  const moodData = generateMoodData();
  const goalProgressData = generateGoalProgressData();
  
  // Colors for charts
  const COLORS = ['#4F46E5', '#059669', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  
  // Calculate habit streaks
  const calculateStreaks = () => {
    if (isLoadingHabitsList) return [];
    
    return habits
      .filter((habit: any) => habit.streak > 0)
      .sort((a: any, b: any) => b.streak - a.streak)
      .slice(0, 5);
  };
  
  const topStreaks = calculateStreaks();
  
  // Calculate overall stats
  const calculateOverallStats = () => {
    if (isLoadingHabits || isLoadingHabitsList || isLoadingGoals || isLoadingMoods) return null;
    
    const totalHabits = habits.length;
    const completedHabits = habitEntries.length;
    const habitCompletionRate = totalHabits > 0 ? Math.round((completedHabits / (totalHabits * 7)) * 100) : 0;
    
    const totalGoals = goals.length;
    const completedGoals = goals.filter((goal: any) => goal.completed).length;
    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    // Calculate average mood
    let avgMood = "Neutral";
    let moodCount = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    
    moodEntries.forEach((entry: any) => {
      if (entry.mood) {
        moodCount[entry.mood as keyof typeof moodCount]++;
      }
    });
    
    if (moodEntries.length > 0) {
      if (moodCount.positive > moodCount.neutral && moodCount.positive > moodCount.negative) {
        avgMood = "Positive";
      } else if (moodCount.negative > moodCount.neutral && moodCount.negative > moodCount.positive) {
        avgMood = "Negative";
      }
    }
    
    return {
      habitCompletionRate,
      goalCompletionRate,
      avgMood
    };
  };
  
  const overallStats = calculateOverallStats();

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500">Track progress and visualize patterns across all areas</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={dateRange}
            onValueChange={setDateRange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="90days">Past 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLoadingHabits || isLoadingHabitsList || isLoadingGoals || isLoadingMoods ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="animate-spin h-8 w-8 border-2 border-primary border-opacity-20 border-t-primary rounded-full mx-auto"></div>
            <p className="mt-4 text-slate-500">Loading analytics data...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Habit Completion Rate</CardTitle>
                <div className="text-2xl font-bold">{overallStats?.habitCompletionRate || 0}%</div>
              </CardHeader>
              <CardContent>
                <Progress value={overallStats?.habitCompletionRate || 0} className="h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Goal Completion Rate</CardTitle>
                <div className="text-2xl font-bold">{overallStats?.goalCompletionRate || 0}%</div>
              </CardHeader>
              <CardContent>
                <Progress value={overallStats?.goalCompletionRate || 0} className="h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Average Mood</CardTitle>
                <div className="text-2xl font-bold">{overallStats?.avgMood || "Neutral"}</div>
              </CardHeader>
              <CardContent>
                {overallStats?.avgMood === "Positive" ? (
                  <div className="bg-green-500 h-2 rounded-full"></div>
                ) : overallStats?.avgMood === "Negative" ? (
                  <div className="bg-red-500 h-2 rounded-full"></div>
                ) : (
                  <div className="bg-amber-500 h-2 rounded-full"></div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="habits" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="habits">Habits</TabsTrigger>
              <TabsTrigger value="moods">Mood Trends</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <TabsContent value="habits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-primary-600" />
                  Habit Completion Rate
                </CardTitle>
                <CardDescription>
                  Daily completion rate for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={habitCompletionData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Completion Rate']}
                      />
                      <Legend />
                      <Bar dataKey="completionRate" name="Completion Rate (%)" fill="#4F46E5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Habit Streaks</CardTitle>
                  <CardDescription>
                    Your longest active habit streaks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topStreaks.length > 0 ? (
                    <div className="space-y-4">
                      {topStreaks.map((habit: any) => (
                        <div key={habit.id} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-primary-600 mr-2"></div>
                            <span className="text-sm font-medium text-slate-700">{habit.title}</span>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-primary-50 text-primary-700 mr-2">
                              {habit.streak} days
                            </Badge>
                            <Progress 
                              value={habit.streak} 
                              max={Math.max(21, habit.streak)} 
                              className="w-24 h-2" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-500">No active habit streaks found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Habit Completion by Time of Day</CardTitle>
                  <CardDescription>
                    When you tend to complete your habits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Morning", value: 45 },
                            { name: "Afternoon", value: 20 },
                            { name: "Evening", value: 35 }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: "Morning", value: 45 },
                            { name: "Afternoon", value: 20 },
                            { name: "Evening", value: 35 }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="moods" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary-600" />
                  Mood Trends
                </CardTitle>
                <CardDescription>
                  Track how your mood has changed over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={moodData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(value) => {
                        switch(value) {
                          case 1: return 'Very Negative';
                          case 2: return 'Negative';
                          case 3: return 'Neutral';
                          case 4: return 'Positive';
                          case 5: return 'Very Positive';
                          default: return '';
                        }
                      }} />
                      <Tooltip formatter={(value) => {
                        switch(Number(value)) {
                          case 1: return 'Very Negative';
                          case 2: return 'Negative';
                          case 3: return 'Neutral';
                          case 4: return 'Positive';
                          case 5: return 'Very Positive';
                          default: return value;
                        }
                      }} />
                      <Legend />
                      <Line type="monotone" dataKey="mood" name="Mood" stroke="#4F46E5" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mood Influencers</CardTitle>
                  <CardDescription>
                    Factors that seem to affect your mood
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-600 mr-2"></div>
                        <span className="text-sm font-medium text-slate-700">Sleep Quality</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Strong Positive</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-600 mr-2"></div>
                        <span className="text-sm font-medium text-slate-700">Exercise</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Positive</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-600 mr-2"></div>
                        <span className="text-sm font-medium text-slate-700">Work Stress</span>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Negative</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-amber-600 mr-2"></div>
                        <span className="text-sm font-medium text-slate-700">Social Interaction</span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800">Mixed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Mood Distribution</CardTitle>
                  <CardDescription>
                    How your moods have been distributed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Positive", value: 65 },
                            { name: "Neutral", value: 25 },
                            { name: "Negative", value: 10 }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#059669" /> {/* Positive - green */}
                          <Cell fill="#F59E0B" /> {/* Neutral - amber */}
                          <Cell fill="#EF4444" /> {/* Negative - red */}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Frequency']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="mr-2 h-5 w-5 text-primary-600" />
                  Goal Status Overview
                </CardTitle>
                <CardDescription>
                  Current status of all your goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={goalProgressData.goalsData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#059669" /> {/* Completed - green */}
                          <Cell fill="#4F46E5" /> {/* Active - blue */}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} goals`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={goalProgressData.progressData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip formatter={(value) => [`${value} goals`, 'Count']} />
                        <Legend />
                        <Bar dataKey="value" name="Active Goals by Progress" fill="#4F46E5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Goal Categories</CardTitle>
                  <CardDescription>
                    Distribution of goals by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Learning", value: 35 },
                            { name: "Wellness", value: 25 },
                            { name: "Career", value: 20 },
                            { name: "Social", value: 15 },
                            { name: "Other", value: 5 }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: "Learning", value: 35 },
                            { name: "Wellness", value: 25 },
                            { name: "Career", value: 20 },
                            { name: "Social", value: 15 },
                            { name: "Other", value: 5 }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Goals Timeline</CardTitle>
                  <CardDescription>
                    Upcoming and recent goal deadlines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {goals.length > 0 ? (
                    <div className="space-y-4">
                      {goals
                        .filter((goal: any) => goal.targetDate && !goal.completed)
                        .sort((a: any, b: any) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
                        .slice(0, 5)
                        .map((goal: any) => (
                          <div key={goal.id} className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              <Calendar className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="ml-2 flex-1">
                              <p className="text-sm font-medium text-slate-700">{goal.title}</p>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-slate-500">
                                  Due: {format(new Date(goal.targetDate), "MMM d, yyyy")}
                                </span>
                                <Progress 
                                  value={(goal.progress / goal.totalSteps) * 100} 
                                  className="w-24 h-2" 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-500">No goals with deadlines found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </>
      )}
    </div>
  );
}
