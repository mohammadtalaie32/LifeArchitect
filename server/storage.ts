import {
  User,
  InsertUser,
  Principle,
  InsertPrinciple, 
  Goal,
  InsertGoal,
  Project,
  InsertProject,
  Habit,
  InsertHabit,
  HabitEntry,
  InsertHabitEntry,
  JournalEntry,
  InsertJournalEntry,
  MoodEntry,
  InsertMoodEntry,
  Event,
  InsertEvent,
  users,
  principles,
  goals,
  projects,
  habits,
  habitEntries,
  journalEntries,
  moodEntries,
  events
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Principles methods
  getPrinciplesByUserId(userId: number): Promise<Principle[]>;
  createPrinciple(principle: InsertPrinciple): Promise<Principle>;
  updatePrinciple(id: number, principle: Partial<InsertPrinciple>): Promise<Principle | undefined>;
  deletePrinciple(id: number): Promise<boolean>;
  
  // Goals methods
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  getGoalById(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Projects methods
  getProjectsByUserId(userId: number): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Habits methods
  getHabitsByUserId(userId: number): Promise<Habit[]>;
  getHabitById(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Habit Entries methods
  getHabitEntriesByHabitId(habitId: number): Promise<HabitEntry[]>;
  getHabitEntriesByUserId(userId: number, date?: Date): Promise<HabitEntry[]>;
  createHabitEntry(entry: InsertHabitEntry): Promise<HabitEntry>;
  deleteHabitEntry(id: number): Promise<boolean>;
  
  // Journal Entries methods
  getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]>;
  getJournalEntryById(id: number): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;
  
  // Mood Entries methods
  getMoodEntriesByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<MoodEntry[]>;
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  
  // Events methods
  getEventsByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private principles: Map<number, Principle>;
  private goals: Map<number, Goal>;
  private projects: Map<number, Project>;
  private habits: Map<number, Habit>;
  private habitEntries: Map<number, HabitEntry>;
  private journalEntries: Map<number, JournalEntry>;
  private moodEntries: Map<number, MoodEntry>;
  private events: Map<number, Event>;
  
  private userIdCounter: number;
  private principleIdCounter: number;
  private goalIdCounter: number;
  private projectIdCounter: number;
  private habitIdCounter: number;
  private habitEntryIdCounter: number;
  private journalEntryIdCounter: number;
  private moodEntryIdCounter: number;
  private eventIdCounter: number;

  constructor() {
    this.users = new Map();
    this.principles = new Map();
    this.goals = new Map();
    this.projects = new Map();
    this.habits = new Map();
    this.habitEntries = new Map();
    this.journalEntries = new Map();
    this.moodEntries = new Map();
    this.events = new Map();
    
    this.userIdCounter = 1;
    this.principleIdCounter = 1;
    this.goalIdCounter = 1;
    this.projectIdCounter = 1;
    this.habitIdCounter = 1;
    this.habitEntryIdCounter = 1;
    this.journalEntryIdCounter = 1;
    this.moodEntryIdCounter = 1;
    this.eventIdCounter = 1;
    
    // Initialize with demo user
    this.createUser({
      username: "demo",
      password: "password",
      name: "Alex Johnson",
      email: "alex@example.com"
    });
    
    // Initialize with sample data for demo user
    this.initializeSampleData(1);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Principles methods
  async getPrinciplesByUserId(userId: number): Promise<Principle[]> {
    return Array.from(this.principles.values())
      .filter(principle => principle.userId === userId)
      .sort((a, b) => a.order - b.order);
  }
  
  async createPrinciple(principle: InsertPrinciple): Promise<Principle> {
    const id = this.principleIdCounter++;
    const newPrinciple: Principle = { ...principle, id };
    this.principles.set(id, newPrinciple);
    return newPrinciple;
  }
  
  async updatePrinciple(id: number, principle: Partial<InsertPrinciple>): Promise<Principle | undefined> {
    const existingPrinciple = this.principles.get(id);
    if (!existingPrinciple) return undefined;
    
    const updatedPrinciple = { ...existingPrinciple, ...principle };
    this.principles.set(id, updatedPrinciple);
    return updatedPrinciple;
  }
  
  async deletePrinciple(id: number): Promise<boolean> {
    return this.principles.delete(id);
  }
  
  // Goals methods
  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId)
      .sort((a, b) => {
        if (a.completed === b.completed) {
          return (a.targetDate || new Date(9999, 11, 31)).getTime() - 
                 (b.targetDate || new Date(9999, 11, 31)).getTime();
        }
        return a.completed ? 1 : -1;
      });
  }
  
  async getGoalById(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }
  
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const id = this.goalIdCounter++;
    const createdAt = new Date();
    const newGoal: Goal = { ...goal, id, createdAt };
    this.goals.set(id, newGoal);
    return newGoal;
  }
  
  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existingGoal = this.goals.get(id);
    if (!existingGoal) return undefined;
    
    const updatedGoal = { ...existingGoal, ...goal };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }
  
  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }
  
  // Projects methods
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId)
      .sort((a, b) => 
        (b.createdAt || new Date()).getTime() - (a.createdAt || new Date()).getTime()
      );
  }
  
  async getProjectById(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const createdAt = new Date();
    const newProject: Project = { ...project, id, createdAt };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
  
  // Habits methods
  async getHabitsByUserId(userId: number): Promise<Habit[]> {
    return Array.from(this.habits.values())
      .filter(habit => habit.userId === userId)
      .sort((a, b) => 
        (b.createdAt || new Date()).getTime() - (a.createdAt || new Date()).getTime()
      );
  }
  
  async getHabitById(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }
  
  async createHabit(habit: InsertHabit): Promise<Habit> {
    const id = this.habitIdCounter++;
    const createdAt = new Date();
    const newHabit: Habit = { ...habit, id, createdAt };
    this.habits.set(id, newHabit);
    return newHabit;
  }
  
  async updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined> {
    const existingHabit = this.habits.get(id);
    if (!existingHabit) return undefined;
    
    const updatedHabit = { ...existingHabit, ...habit };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }
  
  async deleteHabit(id: number): Promise<boolean> {
    return this.habits.delete(id);
  }
  
  // Habit Entries methods
  async getHabitEntriesByHabitId(habitId: number): Promise<HabitEntry[]> {
    return Array.from(this.habitEntries.values())
      .filter(entry => entry.habitId === habitId)
      .sort((a, b) => 
        (b.completedAt || new Date()).getTime() - (a.completedAt || new Date()).getTime()
      );
  }
  
  async getHabitEntriesByUserId(userId: number, date?: Date): Promise<HabitEntry[]> {
    let entries = Array.from(this.habitEntries.values())
      .filter(entry => entry.userId === userId);
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      entries = entries.filter(entry => {
        const entryDate = entry.completedAt || new Date();
        return entryDate >= startOfDay && entryDate <= endOfDay;
      });
    }
    
    return entries.sort((a, b) => 
      (b.completedAt || new Date()).getTime() - (a.completedAt || new Date()).getTime()
    );
  }
  
  async createHabitEntry(entry: InsertHabitEntry): Promise<HabitEntry> {
    const id = this.habitEntryIdCounter++;
    const newEntry: HabitEntry = { ...entry, id };
    this.habitEntries.set(id, newEntry);
    
    // Update streak for the habit
    const habit = await this.getHabitById(entry.habitId);
    if (habit) {
      const updatedStreak = habit.streak + 1;
      const bestStreak = Math.max(updatedStreak, habit.bestStreak || 0);
      
      await this.updateHabit(habit.id, {
        streak: updatedStreak,
        bestStreak: bestStreak
      });
    }
    
    return newEntry;
  }
  
  async deleteHabitEntry(id: number): Promise<boolean> {
    const entry = this.habitEntries.get(id);
    if (!entry) return false;
    
    // Update streak for the habit
    const habit = await this.getHabitById(entry.habitId);
    if (habit && habit.streak > 0) {
      await this.updateHabit(habit.id, {
        streak: habit.streak - 1
      });
    }
    
    return this.habitEntries.delete(id);
  }
  
  // Journal Entries methods
  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => 
        (b.createdAt || new Date()).getTime() - (a.createdAt || new Date()).getTime()
      );
  }
  
  async getJournalEntryById(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }
  
  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.journalEntryIdCounter++;
    const createdAt = new Date();
    const newEntry: JournalEntry = { ...entry, id, createdAt };
    this.journalEntries.set(id, newEntry);
    return newEntry;
  }
  
  async updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const existingEntry = this.journalEntries.get(id);
    if (!existingEntry) return undefined;
    
    const updatedEntry = { ...existingEntry, ...entry };
    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }
  
  // Mood Entries methods
  async getMoodEntriesByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<MoodEntry[]> {
    let entries = Array.from(this.moodEntries.values())
      .filter(entry => entry.userId === userId);
    
    if (startDate) {
      entries = entries.filter(entry => 
        (entry.createdAt || new Date()) >= startDate
      );
    }
    
    if (endDate) {
      entries = entries.filter(entry => 
        (entry.createdAt || new Date()) <= endDate
      );
    }
    
    return entries.sort((a, b) => 
      (b.createdAt || new Date()).getTime() - (a.createdAt || new Date()).getTime()
    );
  }
  
  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const id = this.moodEntryIdCounter++;
    const createdAt = new Date();
    const newEntry: MoodEntry = { ...entry, id, createdAt };
    this.moodEntries.set(id, newEntry);
    return newEntry;
  }
  
  // Events methods
  async getEventsByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<Event[]> {
    let events = Array.from(this.events.values())
      .filter(event => event.userId === userId);
    
    if (startDate) {
      events = events.filter(event => event.startTime >= startDate);
    }
    
    if (endDate) {
      events = events.filter(event => event.startTime <= endDate);
    }
    
    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  async getEventById(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const createdAt = new Date();
    const newEvent: Event = { ...event, id, createdAt };
    this.events.set(id, newEvent);
    return newEvent;
  }
  
  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const existingEvent = this.events.get(id);
    if (!existingEvent) return undefined;
    
    const updatedEvent = { ...existingEvent, ...event };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Initialize sample data for demo purposes
  private initializeSampleData(userId: number) {
    // Add core principles
    this.createPrinciple({
      userId,
      title: "Pursuing Passion",
      description: "Engage daily in activities that fuel creativity and purpose",
      color: "#4F46E5", // primary-600
      order: 1
    });
    
    this.createPrinciple({
      userId,
      title: "Living Sober",
      description: "Maintain clarity of mind and body through committed sobriety",
      color: "#059669", // secondary-600
      order: 2
    });
    
    this.createPrinciple({
      userId,
      title: "Health First",
      description: "Prioritize physical and mental wellbeing in daily decisions",
      color: "#d97706", // accent-600
      order: 3
    });
    
    this.createPrinciple({
      userId,
      title: "Personal Growth",
      description: "Embrace challenges as opportunities to learn and evolve",
      color: "#2563eb", // blue-600
      order: 4
    });
    
    // Add goals
    const today = new Date();
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    const sixteenDaysFromNow = new Date(today);
    sixteenDaysFromNow.setDate(today.getDate() + 16);
    
    const twelveDaysFromNow = new Date(today);
    twelveDaysFromNow.setDate(today.getDate() + 12);
    
    this.createGoal({
      userId,
      title: "Complete coding course module",
      description: "Finish the React course on Udemy",
      targetDate: twoDaysFromNow,
      completed: false,
      progress: 3,
      totalSteps: 4,
      color: "#4F46E5", // primary-600
      category: "Learning"
    });
    
    this.createGoal({
      userId,
      title: "Maintain 30-day meditation streak",
      description: "Meditate for at least 10 minutes daily",
      targetDate: sixteenDaysFromNow,
      completed: false,
      progress: 14,
      totalSteps: 30,
      color: "#059669", // secondary-500
      category: "Wellness"
    });
    
    this.createGoal({
      userId,
      title: "Attend 2 networking events",
      description: "Expand professional connections",
      targetDate: twelveDaysFromNow,
      completed: false,
      progress: 1,
      totalSteps: 2,
      color: "#F59E0B", // accent-500
      category: "Social"
    });
    
    // Add habits
    const morning = this.createHabit({
      userId,
      title: "Morning Journal",
      description: "Document thoughts and set intentions for the day",
      frequency: "daily",
      timeOfDay: "morning",
      streak: 5,
      bestStreak: 21
    });
    
    const meditation = this.createHabit({
      userId,
      title: "Meditation",
      description: "Mindfulness practice",
      frequency: "daily",
      timeOfDay: "morning",
      streak: 5,
      bestStreak: 30
    });
    
    const exercise = this.createHabit({
      userId,
      title: "Exercise",
      description: "Physical activity for at least 30 minutes",
      frequency: "daily",
      timeOfDay: "evening",
      streak: 3,
      bestStreak: 14
    });
    
    const coding = this.createHabit({
      userId,
      title: "Coding Practice",
      description: "Work on personal coding projects",
      frequency: "daily",
      timeOfDay: "evening",
      streak: 2,
      bestStreak: 10
    });
    
    const reading = this.createHabit({
      userId,
      title: "Reading",
      description: "Read non-fiction for personal development",
      frequency: "daily",
      timeOfDay: "evening",
      streak: 4,
      bestStreak: 15
    });
    
    const evening = this.createHabit({
      userId,
      title: "Evening Reflection",
      description: "Reflect on the day's achievements and challenges",
      frequency: "daily",
      timeOfDay: "evening",
      streak: 5,
      bestStreak: 21
    });
    
    const gratitude = this.createHabit({
      userId,
      title: "Gratitude Journal",
      description: "Write down three things you're grateful for",
      frequency: "daily",
      timeOfDay: "evening",
      streak: 5,
      bestStreak: 30
    });
    
    const noPhone = this.createHabit({
      userId,
      title: "No Phone Before Bed",
      description: "Avoid screen time at least 30 minutes before sleep",
      frequency: "daily",
      timeOfDay: "evening",
      streak: 2,
      bestStreak: 14
    });
    
    // Add habit entries for today
    const sevenThirtyAM = new Date(today);
    sevenThirtyAM.setHours(7, 30, 0, 0);
    
    const eightFifteenAM = new Date(today);
    eightFifteenAM.setHours(8, 15, 0, 0);
    
    const sixFortyFivePM = new Date(today);
    sixFortyFivePM.setHours(18, 45, 0, 0);
    
    const eightThirtyPM = new Date(today);
    eightThirtyPM.setHours(20, 30, 0, 0);
    
    const tenFifteenPM = new Date(today);
    tenFifteenPM.setHours(22, 15, 0, 0);
    
    this.createHabitEntry({
      habitId: morning.id,
      userId,
      completed: true,
      completedAt: sevenThirtyAM,
      notes: "Focused on setting intentions for the day"
    });
    
    this.createHabitEntry({
      habitId: meditation.id,
      userId,
      completed: true,
      completedAt: eightFifteenAM,
      notes: "10 minute guided meditation"
    });
    
    this.createHabitEntry({
      habitId: exercise.id,
      userId,
      completed: true,
      completedAt: sixFortyFivePM,
      notes: "30 minute run"
    });
    
    this.createHabitEntry({
      habitId: coding.id,
      userId,
      completed: true,
      completedAt: eightThirtyPM,
      notes: "Worked on React project"
    });
    
    this.createHabitEntry({
      habitId: reading.id,
      userId,
      completed: true,
      completedAt: tenFifteenPM,
      notes: "Read 'Atomic Habits' for 30 minutes"
    });
    
    // Add journal entries
    this.createJournalEntry({
      userId,
      title: "Morning Reflection",
      content: "I'm feeling optimistic about today's coding challenge. The meditation routine is really helping with focus. Need to remember to drink more water throughout the day.",
      mood: "positive",
      tags: ["Reflection", "Coding", "Wellness"]
    });
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    this.createJournalEntry({
      userId,
      title: "Evening Check-in",
      content: "Completed the first module of the React course today. Proud of staying on track. Had a moment of craving in the evening but used the breathing technique successfully. Need to prepare for tomorrow's meeting.",
      mood: "positive",
      tags: ["Achievement", "Sobriety", "Learning"],
      createdAt: yesterday
    });
    
    // Add mood entries for the past week
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start from Monday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      
      let mood: string;
      let intensityLevel: number;
      
      if (i === 3 || i === 4) { // Thursday, Friday
        mood = "neutral";
        intensityLevel = 3;
      } else {
        mood = "positive";
        intensityLevel = i === 1 || i === 5 ? 4 : 5; // Tuesday, Saturday: Good, Others: Very Good
      }
      
      this.createMoodEntry({
        userId,
        mood,
        intensityLevel,
        factors: {
          exercise: i === 0 || i === 2 || i === 6 ? 3 : 2, // Monday, Wednesday, Sunday: 3 stars
          sleep: i === 1 || i === 5 || i === 6 ? 4 : 3, // Tuesday, Saturday, Sunday: 4 stars
          socialInteraction: i === 5 || i === 6 ? 2 : 1 // Weekend: 2 stars
        },
        notes: `Overall ${mood} day`,
        createdAt: day
      });
    }
    
    // Add upcoming events
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(20, 0, 0, 0);
    
    const friday = new Date(today);
    friday.setDate(today.getDate() + (5 - today.getDay()));
    friday.setHours(19, 30, 0, 0);
    
    const fridayEnd = new Date(friday);
    fridayEnd.setHours(21, 0, 0, 0);
    
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + (6 - today.getDay()));
    saturday.setHours(10, 0, 0, 0);
    
    const saturdayEnd = new Date(saturday);
    saturdayEnd.setHours(12, 0, 0, 0);
    
    this.createEvent({
      userId,
      title: "Coding Meetup",
      description: "Virtual meetup with the web development group",
      location: "Virtual Meeting",
      startTime: tomorrow,
      endTime: tomorrowEnd,
      category: "Learning",
      icon: "code"
    });
    
    this.createEvent({
      userId,
      title: "Recovery Group",
      description: "Weekly support group meeting",
      location: "Community Center",
      startTime: friday,
      endTime: fridayEnd,
      category: "Wellness",
      icon: "users"
    });
    
    this.createEvent({
      userId,
      title: "Wellness Workshop",
      description: "Outdoor meditation and yoga session",
      location: "Local Park",
      startTime: saturday,
      endTime: saturdayEnd,
      category: "Wellness",
      icon: "building"
    });
  }
}

export const storage = new MemStorage();
