import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/useAuth";
import { 
  CheckCircle, 
  BarChart2, 
  Zap, 
  Calendar 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import StatCard from "@/components/dashboard/StatCard";
import GoalItem from "@/components/dashboard/GoalItem";
import HabitItem from "@/components/dashboard/HabitItem";
import JournalEntryComponent from "@/components/dashboard/JournalEntry";
import PrincipleItem from "@/components/dashboard/PrincipleItem";
import MoodTracker from "@/components/dashboard/MoodTracker";
import EventItem from "@/components/dashboard/EventItem";
import { format } from "date-fns";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Fetch data from API
  const { data: principles } = useQuery({
    queryKey: ['/api/principles'],
  });
  
  const { data: goals } = useQuery({
    queryKey: ['/api/goals'],
  });
  
  const { data: habits } = useQuery({
    queryKey: ['/api/habits'],
  });
  
  const { data: habitEntries } = useQuery({
    queryKey: ['/api/habit-entries'],
    // Pass current date as query param
    queryFn: async () => {
      const res = await fetch(`/api/habit-entries?date=${currentDate.toISOString()}`);
      if (!res.ok) throw new Error('Failed to fetch habit entries');
      return res.json();
    },
  });
  
  const { data: journalEntries } = useQuery({
    queryKey: ['/api/journal-entries'],
  });
  
  const { data: events } = useQuery({
    queryKey: ['/api/events'],
  });

  // Calculate stats
  const totalHabits = habits?.length || 0;
  const completedHabits = habitEntries?.length || 0;
  const habitsProgress = totalHabits ? (completedHabits / totalHabits) * 100 : 0;
  
  const activeGoals = goals?.filter((goal: any) => !goal.completed)?.length || 0;
  const completedGoalsThisWeek = goals?.filter((goal: any) => 
    goal.completed && goal.createdAt && 
    new Date(goal.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  )?.length || 0;

  // Navigate between days
  const goToPreviousDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Welcome back, {user?.name || user?.username}. Here's your progress today.</p>
      </div>
      
      {/* Date Selection */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 p-0" 
            onClick={goToPreviousDay}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
        
        <div className="mt-4 w-full md:mt-0 md:w-auto">
          <Button variant="outline" className="w-full md:w-auto">
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<CheckCircle />}
          title="Habits Completed"
          value={`${completedHabits}/${totalHabits}`}
          progress={habitsProgress}
          progressLabel={`${habitsProgress.toFixed(1)}%`}
          variant="primary"
        />
        
        <StatCard 
          icon={<BarChart2 />}
          title="Goal Progress"
          value={`${activeGoals} Active`}
          additionalInfo={`${completedGoalsThisWeek} goal${completedGoalsThisWeek !== 1 ? 's' : ''} completed this week`}
          variant="secondary"
        />
        
        <StatCard 
          icon={<Zap />}
          title="Mood Trend"
          value="Positive"
          progress={80}
          variant="accent"
        />
        
        <StatCard 
          icon={<Calendar />}
          title="Streak"
          value="14 Days"
          additionalInfo="Your longest streak: 21 days"
          variant="neutral"
        />
      </div>
      
      {/* Two Column Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Goals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg">Upcoming Goals</CardTitle>
              <Button variant="link" className="h-auto p-0">View All</Button>
            </CardHeader>
            <CardContent className="pt-0">
              {goals?.length > 0 ? (
                goals.slice(0, 3).map((goal: any) => (
                  <GoalItem key={goal.id} goal={goal} />
                ))
              ) : (
                <p className="text-sm text-slate-500">No goals found. Add some goals to track your progress.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Habit Tracker */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg">Daily Habits</CardTitle>
              <Button variant="link" className="h-auto p-0">Add Habit</Button>
            </CardHeader>
            <CardContent className="pt-0">
              {habits?.length > 0 ? (
                habits.map((habit: any) => {
                  const entry = habitEntries?.find((e: any) => e.habitId === habit.id);
                  const isChecked = Boolean(entry);
                  const completedTime = entry?.completedAt ? 
                    new Date(entry.completedAt).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit', 
                      hour12: true 
                    }) : undefined;
                    
                  return (
                    <HabitItem 
                      key={habit.id} 
                      habit={habit} 
                      isChecked={isChecked} 
                      completedTime={completedTime}
                    />
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">No habits found. Add some habits to track your daily routine.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Journal Entries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg">Recent Journal Entries</CardTitle>
              <Button variant="link" className="h-auto p-0">New Entry</Button>
            </CardHeader>
            <Separator />
            {journalEntries?.length > 0 ? (
              journalEntries.slice(0, 2).map((entry: any) => (
                <div key={entry.id}>
                  <JournalEntryComponent entry={entry} />
                  <Separator />
                </div>
              ))
            ) : (
              <CardContent>
                <p className="text-sm text-slate-500">No journal entries found. Start journaling to track your thoughts and feelings.</p>
              </CardContent>
            )}
          </Card>
        </div>
        
        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Core Principles */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Core Principles</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {principles?.length > 0 ? (
                principles.map((principle: any) => (
                  <PrincipleItem key={principle.id} principle={principle} />
                ))
              ) : (
                <p className="text-sm text-slate-500">No principles defined yet. Define your core principles to guide your journey.</p>
              )}
              
              <Button variant="link" className="w-full justify-center text-xs p-0 h-auto mt-2">
                Edit Principles
              </Button>
            </CardContent>
          </Card>
          
          {/* Mood Tracker */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Mood Tracker</CardTitle>
            </CardHeader>
            <MoodTracker userId={user?.id || 0} />
          </Card>
          
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <Separator />
            {events?.length > 0 ? (
              events.map((event: any) => (
                <div key={event.id}>
                  <EventItem event={event} />
                  <Separator />
                </div>
              ))
            ) : (
              <CardContent>
                <p className="text-sm text-slate-500">No upcoming events. Add some events to your calendar.</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
