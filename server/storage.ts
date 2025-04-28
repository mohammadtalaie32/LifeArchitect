import {
  User,
  InsertUser,
  UserSettings,
  InsertUserSettings,
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
  Activity,
  InsertActivity,
  Tag,
  InsertTag,
  ActivityTag,
  InsertActivityTag,
  users,
  userSettings,
  principles,
  goals,
  projects,
  habits,
  habitEntries,
  journalEntries,
  moodEntries,
  events,
  activities,
  tags,
  activityTags
} from "@shared/schema";

import { db } from "./db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // User Settings methods
  getUserSettings(userId: number): Promise<UserSettings[]>;
  getUserSettingByModule(userId: number, moduleName: string): Promise<UserSettings | undefined>;
  createUserSetting(setting: InsertUserSettings): Promise<UserSettings>;
  updateUserSetting(id: number, setting: Partial<InsertUserSettings>): Promise<UserSettings | undefined>;
  deleteUserSetting(id: number): Promise<boolean>;
  
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
  
  // Activities methods
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  getActivityById(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  
  // Tags methods
  getTagsByUserId(userId: number): Promise<Tag[]>;
  getTagById(id: number): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: number): Promise<boolean>;
  
  // Activity Tags methods
  getActivityTagsByActivityId(activityId: number): Promise<ActivityTag[]>;
  getActivityTagsByTagId(tagId: number): Promise<ActivityTag[]>;
  createActivityTag(activityTag: InsertActivityTag): Promise<ActivityTag>;
  deleteActivityTag(activityId: number, tagId: number): Promise<boolean>;
  
  // Database initialization method
  initializeData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userSettings: Map<number, UserSettings>;
  private principles: Map<number, Principle>;
  private goals: Map<number, Goal>;
  private projects: Map<number, Project>;
  private habits: Map<number, Habit>;
  private habitEntries: Map<number, HabitEntry>;
  private journalEntries: Map<number, JournalEntry>;
  private moodEntries: Map<number, MoodEntry>;
  private events: Map<number, Event>;
  private activities: Map<number, Activity>;
  private tags: Map<number, Tag>;
  private activityTags: Map<string, ActivityTag>;
  
  private userIdCounter: number;
  private userSettingIdCounter: number;
  private principleIdCounter: number;
  private goalIdCounter: number;
  private projectIdCounter: number;
  private habitIdCounter: number;
  private habitEntryIdCounter: number;
  private journalEntryIdCounter: number;
  private moodEntryIdCounter: number;
  private eventIdCounter: number;
  private activityIdCounter: number;
  private tagIdCounter: number;

  constructor() {
    this.users = new Map();
    this.userSettings = new Map();
    this.principles = new Map();
    this.goals = new Map();
    this.projects = new Map();
    this.habits = new Map();
    this.habitEntries = new Map();
    this.journalEntries = new Map();
    this.moodEntries = new Map();
    this.events = new Map();
    this.activities = new Map();
    this.tags = new Map();
    this.activityTags = new Map();
    
    this.userIdCounter = 1;
    this.userSettingIdCounter = 1;
    this.principleIdCounter = 1;
    this.goalIdCounter = 1;
    this.projectIdCounter = 1;
    this.habitIdCounter = 1;
    this.habitEntryIdCounter = 1;
    this.journalEntryIdCounter = 1;
    this.moodEntryIdCounter = 1;
    this.eventIdCounter = 1;
    this.activityIdCounter = 1;
    this.tagIdCounter = 1;
    
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
  
  // User Settings methods
  async getUserSettings(userId: number): Promise<UserSettings[]> {
    return Array.from(this.userSettings.values())
      .filter(setting => setting.userId === userId)
      .sort((a, b) => a.moduleName.localeCompare(b.moduleName));
  }
  
  async getUserSettingByModule(userId: number, moduleName: string): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values())
      .find(setting => setting.userId === userId && setting.moduleName === moduleName);
  }
  
  async createUserSetting(setting: InsertUserSettings): Promise<UserSettings> {
    const id = this.userSettingIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newSetting: UserSettings = { ...setting, id, createdAt, updatedAt };
    this.userSettings.set(id, newSetting);
    return newSetting;
  }
  
  async updateUserSetting(id: number, setting: Partial<InsertUserSettings>): Promise<UserSettings | undefined> {
    const existingSetting = this.userSettings.get(id);
    if (!existingSetting) return undefined;
    
    const updatedAt = new Date();
    const updatedSetting = { ...existingSetting, ...setting, updatedAt };
    this.userSettings.set(id, updatedSetting);
    return updatedSetting;
  }
  
  async deleteUserSetting(id: number): Promise<boolean> {
    return this.userSettings.delete(id);
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
  
  // Activities methods
  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => {
        // First sort by quadrant
        if (a.quadrant !== b.quadrant) {
          return a.quadrant.localeCompare(b.quadrant);
        }
        // Then by priority
        return (a.priority || 0) - (b.priority || 0);
      });
  }
  
  async getActivityById(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const createdAt = new Date();
    const newActivity: Activity = { ...activity, id, createdAt };
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  async updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined> {
    const existingActivity = this.activities.get(id);
    if (!existingActivity) return undefined;
    
    const updatedActivity = { ...existingActivity, ...activity };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }
  
  async deleteActivity(id: number): Promise<boolean> {
    // Delete associated activity tags first
    const activityTagKeys: string[] = [];
    for (const [key, activityTag] of this.activityTags.entries()) {
      if (activityTag.activityId === id) {
        activityTagKeys.push(key);
      }
    }
    
    for (const key of activityTagKeys) {
      this.activityTags.delete(key);
    }
    
    return this.activities.delete(id);
  }
  
  // Tags methods
  async getTagsByUserId(userId: number): Promise<Tag[]> {
    return Array.from(this.tags.values())
      .filter(tag => tag.userId === userId);
  }
  
  async getTagById(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }
  
  async createTag(tag: InsertTag): Promise<Tag> {
    const id = this.tagIdCounter++;
    const createdAt = new Date();
    const newTag: Tag = { ...tag, id, createdAt };
    this.tags.set(id, newTag);
    return newTag;
  }
  
  async updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined> {
    const existingTag = this.tags.get(id);
    if (!existingTag) return undefined;
    
    const updatedTag = { ...existingTag, ...tag };
    this.tags.set(id, updatedTag);
    return updatedTag;
  }
  
  async deleteTag(id: number): Promise<boolean> {
    // Delete associated activity tags first
    const activityTagKeys: string[] = [];
    for (const [key, activityTag] of this.activityTags.entries()) {
      if (activityTag.tagId === id) {
        activityTagKeys.push(key);
      }
    }
    
    for (const key of activityTagKeys) {
      this.activityTags.delete(key);
    }
    
    return this.tags.delete(id);
  }
  
  // Activity Tags methods
  async getActivityTagsByActivityId(activityId: number): Promise<ActivityTag[]> {
    return Array.from(this.activityTags.values())
      .filter(tag => tag.activityId === activityId);
  }
  
  async getActivityTagsByTagId(tagId: number): Promise<ActivityTag[]> {
    return Array.from(this.activityTags.values())
      .filter(tag => tag.tagId === tagId);
  }
  
  async createActivityTag(activityTag: InsertActivityTag): Promise<ActivityTag> {
    const key = `${activityTag.activityId}-${activityTag.tagId}`;
    const createdAt = new Date();
    const newActivityTag: ActivityTag = { 
      ...activityTag, 
      createdAt,
      // Ensure these exist with proper null if not defined
      principleId: activityTag.principleId || null,
      goalId: activityTag.goalId || null
    };
    this.activityTags.set(key, newActivityTag);
    return newActivityTag;
  }
  
  async deleteActivityTag(activityId: number, tagId: number): Promise<boolean> {
    const key = `${activityId}-${tagId}`;
    return this.activityTags.delete(key);
  }
  
  // Initialize database with sample data
  async initializeData(): Promise<void> {
    // Check if we already have users
    const users = Array.from(this.users.values());
    if (users.length === 0) {
      // Create a demo user if none exists
      const demoUser = await this.createUser({
        username: "demo",
        password: "password",
        name: "Demo User",
        email: "demo@example.com"
      });
      
      // Initialize sample data for the demo user
      this.initializeSampleData(demoUser.id);
    }
  }
  
  // Initialize sample data for demo purposes
  private initializeSampleData(userId: number) {
    // Initialize default user settings for modules
    this.createUserSetting({
      userId,
      moduleName: "dashboard",
      enabled: true,
      displayOrder: 1,
      settings: { widgets: ["goals", "habits", "activities", "mood"] }
    });
    
    this.createUserSetting({
      userId,
      moduleName: "goals",
      enabled: true,
      displayOrder: 2,
      settings: { defaultView: "list" }
    });
    
    this.createUserSetting({
      userId,
      moduleName: "habits",
      enabled: true,
      displayOrder: 3,
      settings: { reminderTime: "08:00" }
    });
    
    this.createUserSetting({
      userId,
      moduleName: "activities",
      enabled: true,
      displayOrder: 4,
      settings: { defaultQuadrant: "do" }
    });
    
    this.createUserSetting({
      userId,
      moduleName: "principles",
      enabled: true,
      displayOrder: 5,
      settings: {}
    });
    
    this.createUserSetting({
      userId,
      moduleName: "projects",
      enabled: true,
      displayOrder: 6,
      settings: {}
    });
    
    this.createUserSetting({
      userId,
      moduleName: "journal",
      enabled: true,
      displayOrder: 7,
      settings: { reminderTime: "20:00" }
    });
    
    this.createUserSetting({
      userId,
      moduleName: "mood",
      enabled: true,
      displayOrder: 8,
      settings: { factors: ["sleep", "exercise", "nutrition", "social", "work"] }
    });
    
    this.createUserSetting({
      userId,
      moduleName: "calendar",
      enabled: true,
      displayOrder: 9,
      settings: { defaultView: "week" }
    });
    
    this.createUserSetting({
      userId,
      moduleName: "analytics",
      enabled: true,
      displayOrder: 10,
      settings: { defaultTimeRange: "month" }
    });
    
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

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  // User Settings methods
  async getUserSettings(userId: number): Promise<UserSettings[]> {
    return db.select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .orderBy(userSettings.moduleName);
  }
  
  async getUserSettingByModule(userId: number, moduleName: string): Promise<UserSettings | undefined> {
    const result = await db.select()
      .from(userSettings)
      .where(and(
        eq(userSettings.userId, userId),
        eq(userSettings.moduleName, moduleName)
      ));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createUserSetting(setting: InsertUserSettings): Promise<UserSettings> {
    const result = await db.insert(userSettings).values(setting).returning();
    return result[0];
  }
  
  async updateUserSetting(id: number, setting: Partial<InsertUserSettings>): Promise<UserSettings | undefined> {
    const now = new Date();
    const result = await db.update(userSettings)
      .set({ ...setting, updatedAt: now })
      .where(eq(userSettings.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteUserSetting(id: number): Promise<boolean> {
    await db.delete(userSettings).where(eq(userSettings.id, id));
    return true;
  }
  
  // Principles methods
  async getPrinciplesByUserId(userId: number): Promise<Principle[]> {
    return db.select().from(principles).where(eq(principles.userId, userId)).orderBy(principles.order);
  }
  
  async createPrinciple(principle: InsertPrinciple): Promise<Principle> {
    const result = await db.insert(principles).values(principle).returning();
    return result[0];
  }
  
  async updatePrinciple(id: number, principle: Partial<InsertPrinciple>): Promise<Principle | undefined> {
    const result = await db.update(principles)
      .set(principle)
      .where(eq(principles.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deletePrinciple(id: number): Promise<boolean> {
    await db.delete(principles).where(eq(principles.id, id));
    return true;
  }
  
  // Goals methods
  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
  }
  
  async getGoalById(id: number): Promise<Goal | undefined> {
    const result = await db.select().from(goals).where(eq(goals.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const result = await db.insert(goals).values(goal).returning();
    return result[0];
  }
  
  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const result = await db.update(goals)
      .set(goal)
      .where(eq(goals.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteGoal(id: number): Promise<boolean> {
    await db.delete(goals).where(eq(goals.id, id));
    return true;
  }
  
  // Projects methods
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
  }
  
  async getProjectById(id: number): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }
  
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await db.update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }
  
  // Habits methods
  async getHabitsByUserId(userId: number): Promise<Habit[]> {
    return db.select().from(habits).where(eq(habits.userId, userId));
  }
  
  async getHabitById(id: number): Promise<Habit | undefined> {
    const result = await db.select().from(habits).where(eq(habits.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createHabit(habit: InsertHabit): Promise<Habit> {
    const result = await db.insert(habits).values(habit).returning();
    return result[0];
  }
  
  async updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined> {
    const result = await db.update(habits)
      .set(habit)
      .where(eq(habits.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteHabit(id: number): Promise<boolean> {
    await db.delete(habits).where(eq(habits.id, id));
    return true;
  }
  
  // Habit Entries methods
  async getHabitEntriesByHabitId(habitId: number): Promise<HabitEntry[]> {
    return db.select().from(habitEntries).where(eq(habitEntries.habitId, habitId));
  }
  
  async getHabitEntriesByUserId(userId: number, date?: Date): Promise<HabitEntry[]> {
    if (!date) {
      return db.select().from(habitEntries).where(eq(habitEntries.userId, userId));
    }
    
    // Start and end of the given date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return db.select().from(habitEntries)
      .where(and(
        eq(habitEntries.userId, userId),
        gte(habitEntries.completedAt, startDate),
        lte(habitEntries.completedAt, endDate)
      ));
  }
  
  async createHabitEntry(entry: InsertHabitEntry): Promise<HabitEntry> {
    const result = await db.insert(habitEntries).values(entry).returning();
    
    // Update streak for the habit
    const habitId = entry.habitId;
    const habit = await this.getHabitById(habitId);
    
    if (habit) {
      const updatedStreak = (habit.streak || 0) + 1;
      const bestStreak = Math.max(updatedStreak, habit.bestStreak || 0);
      
      await this.updateHabit(habitId, {
        streak: updatedStreak,
        bestStreak: bestStreak
      });
    }
    
    return result[0];
  }
  
  async deleteHabitEntry(id: number): Promise<boolean> {
    const entries = await db.select().from(habitEntries).where(eq(habitEntries.id, id));
    
    if (entries.length > 0) {
      const entry = entries[0];
      const habitId = entry.habitId;
      const habit = await this.getHabitById(habitId);
      
      if (habit && habit.streak && habit.streak > 0) {
        await this.updateHabit(habitId, {
          streak: habit.streak - 1
        });
      }
    }
    
    await db.delete(habitEntries).where(eq(habitEntries.id, id));
    return true;
  }
  
  // Journal Entries methods
  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return db.select().from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }
  
  async getJournalEntryById(id: number): Promise<JournalEntry | undefined> {
    const result = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const result = await db.insert(journalEntries).values(entry).returning();
    return result[0];
  }
  
  async updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const result = await db.update(journalEntries)
      .set(entry)
      .where(eq(journalEntries.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteJournalEntry(id: number): Promise<boolean> {
    await db.delete(journalEntries).where(eq(journalEntries.id, id));
    return true;
  }
  
  // Mood Entries methods
  async getMoodEntriesByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<MoodEntry[]> {
    if (!startDate && !endDate) {
      return db.select().from(moodEntries)
        .where(eq(moodEntries.userId, userId))
        .orderBy(desc(moodEntries.createdAt));
    }
    
    let conditions = [eq(moodEntries.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(moodEntries.createdAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(moodEntries.createdAt, endDate));
    }
    
    return db.select().from(moodEntries)
      .where(and(...conditions))
      .orderBy(desc(moodEntries.createdAt));
  }
  
  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const result = await db.insert(moodEntries).values(entry).returning();
    return result[0];
  }
  
  // Events methods
  async getEventsByUserId(userId: number, startDate?: Date, endDate?: Date): Promise<Event[]> {
    if (!startDate && !endDate) {
      return db.select().from(events)
        .where(eq(events.userId, userId))
        .orderBy(asc(events.startTime));
    }
    
    let conditions = [eq(events.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(events.startTime, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(events.startTime, endDate));
    }
    
    return db.select().from(events)
      .where(and(...conditions))
      .orderBy(asc(events.startTime));
  }
  
  async getEventById(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }
  
  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    await db.delete(events).where(eq(events.id, id));
    return true;
  }
  
  // Activities methods
  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return db.select().from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(asc(activities.quadrant), asc(activities.priority));
  }
  
  async getActivityById(id: number): Promise<Activity | undefined> {
    const result = await db.select().from(activities).where(eq(activities.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(activity).returning();
    return result[0];
  }
  
  async updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined> {
    const result = await db.update(activities)
      .set(activity)
      .where(eq(activities.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteActivity(id: number): Promise<boolean> {
    await db.delete(activities).where(eq(activities.id, id));
    return true;
  }
  
  // Tags methods
  async getTagsByUserId(userId: number): Promise<Tag[]> {
    return db.select().from(tags).where(eq(tags.userId, userId));
  }
  
  async getTagById(id: number): Promise<Tag | undefined> {
    const result = await db.select().from(tags).where(eq(tags.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createTag(tag: InsertTag): Promise<Tag> {
    const result = await db.insert(tags).values(tag).returning();
    return result[0];
  }
  
  async updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined> {
    const result = await db.update(tags)
      .set(tag)
      .where(eq(tags.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteTag(id: number): Promise<boolean> {
    await db.delete(tags).where(eq(tags.id, id));
    return true;
  }
  
  // Activity Tags methods
  async getActivityTagsByActivityId(activityId: number): Promise<ActivityTag[]> {
    return db.select().from(activityTags).where(eq(activityTags.activityId, activityId));
  }
  
  async getActivityTagsByTagId(tagId: number): Promise<ActivityTag[]> {
    return db.select().from(activityTags).where(eq(activityTags.tagId, tagId));
  }
  
  async createActivityTag(activityTag: InsertActivityTag): Promise<ActivityTag> {
    const result = await db.insert(activityTags).values(activityTag).returning();
    return result[0];
  }
  
  async deleteActivityTag(activityId: number, tagId: number): Promise<boolean> {
    await db.delete(activityTags).where(
      and(
        eq(activityTags.activityId, activityId),
        eq(activityTags.tagId, tagId)
      )
    );
    return true;
  }
  
  // Initialize sample data for a new installation
  async initializeData(): Promise<void> {
    try {
      // Check if we have any users
      const existingUsers = await db.select().from(users);
      
      if (existingUsers.length === 0) {
        // Create a demo user
        const demoUser = await this.createUser({
          username: "demo",
          password: "password",
          name: "Demo User",
          email: "demo@example.com"
        });
        
        const userId = demoUser.id;
        
        // Add core principles
        await this.createPrinciple({
          userId,
          title: "Pursuing Passion",
          description: "Always pursue activities that ignite your enthusiasm and energy.",
          color: "#FE4A49",
          order: 1
        });
        
        await this.createPrinciple({
          userId,
          title: "Continuous Learning",
          description: "Embrace new knowledge and skills as opportunities for growth.",
          color: "#2AB7CA",
          order: 2
        });
        
        await this.createPrinciple({
          userId,
          title: "Balanced Living",
          description: "Maintain harmony between work, relationships, health, and personal time.",
          color: "#FED766",
          order: 3
        });
        
        await this.createPrinciple({
          userId,
          title: "Authentic Relationships",
          description: "Build connections based on honesty, mutual respect, and genuine care.",
          color: "#F86624",
          order: 4
        });
        
        // Add goals
        await this.createGoal({
          userId,
          title: "Complete coding course module",
          description: "Finish the React advanced patterns section",
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          completed: false,
          progress: 75,
          totalSteps: 100,
          color: "#4361EE",
          category: "learning"
        });
        
        await this.createGoal({
          userId,
          title: "Run a half marathon",
          description: "Train for and complete a 21K run",
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          completed: false,
          progress: 30,
          totalSteps: 100,
          color: "#F94144",
          category: "health"
        });
        
        // Add habits
        const morningJournalHabit = await this.createHabit({
          userId,
          title: "Morning Journal",
          description: "Write in journal for 10 minutes after waking up",
          frequency: "daily",
          timeOfDay: "morning",
          streak: 5,
          bestStreak: 14
        });
        
        await this.createHabit({
          userId,
          title: "Evening Reading",
          description: "Read a book for 30 minutes before bed",
          frequency: "daily",
          timeOfDay: "evening",
          streak: 3,
          bestStreak: 21
        });
        
        await this.createHabit({
          userId,
          title: "Weekly Review",
          description: "Review goals and plan the upcoming week",
          frequency: "weekly",
          timeOfDay: "evening",
          streak: 2,
          bestStreak: 8
        });
        
        // Add a habit entry for "Morning Journal" today
        await this.createHabitEntry({
          habitId: morningJournalHabit.id,
          userId,
          completed: true,
          completedAt: new Date(),
          notes: "Wrote about yesterday's accomplishments and today's goals"
        });
        
        // Add journal entries
        await this.createJournalEntry({
          userId,
          title: "Morning Reflection",
          content: "Today I'm feeling motivated to start on the new project. I've been thinking about the approach and I'm excited to implement some of the ideas that have been brewing.",
          mood: "positive",
          tags: ["motivation", "work", "project"]
        });
        
        await this.createJournalEntry({
          userId,
          title: "Weekend Plans",
          content: "Thinking about taking a short hike this weekend. Need to disconnect from screens and connect with nature. Maybe invite a friend along.",
          mood: "neutral",
          tags: ["plans", "nature", "self-care"]
        });
        
        // Add mood entries
        await this.createMoodEntry({
          userId,
          mood: "positive",
          intensityLevel: 4,
          factors: { factors: ["Good sleep", "Productive work session", "Social interaction"] },
          notes: "Had a great day overall - accomplished key tasks and had good energy levels"
        });
        
        // Add events
        await this.createEvent({
          userId,
          title: "Coding Meetup",
          description: "Local JavaScript developer meetup at the tech hub",
          location: "TechHub Downtown",
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // 3 days from now at 6 PM
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // 3 days from now at 8 PM
          category: "networking",
          icon: "users"
        });
        
        await this.createEvent({
          userId,
          title: "Project Deadline",
          description: "Submit the final version of the project",
          startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // 10 days from now at 9 AM
          category: "work",
          icon: "calendar"
        });
        
        // Add example activities for Eisenhower Matrix
        await this.createActivity({
          userId,
          title: "Finish project proposal",
          description: "Complete the client proposal document",
          quadrant: "urgent-important",
          status: "in-progress",
          priority: 1,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
          estimatedTime: 120,
          color: "#e63946",
          icon: "file-text"
        });
        
        await this.createActivity({
          userId,
          title: "Weekly team meeting",
          description: "Prepare for and attend the weekly team sync",
          quadrant: "urgent-important",
          status: "pending",
          priority: 2,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
          estimatedTime: 60,
          color: "#e63946",
          icon: "users"
        });
        
        await this.createActivity({
          userId,
          title: "Learn new framework",
          description: "Study the new front-end framework documentation",
          quadrant: "not-urgent-important",
          status: "pending",
          priority: 1,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In 2 weeks
          estimatedTime: 240,
          color: "#457b9d",
          icon: "book"
        });
        
        await this.createActivity({
          userId,
          title: "Update resume",
          description: "Add recent projects and update skills section",
          quadrant: "not-urgent-important",
          status: "pending",
          priority: 2,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // In a month
          estimatedTime: 90,
          color: "#457b9d",
          icon: "file"
        });
        
        await this.createActivity({
          userId,
          title: "Respond to non-urgent emails",
          description: "Clear out inbox of non-critical messages",
          quadrant: "urgent-not-important",
          status: "pending",
          priority: 1,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
          estimatedTime: 45,
          color: "#f4a261",
          icon: "mail"
        });
        
        await this.createActivity({
          userId,
          title: "Fix minor UI bug",
          description: "Address the styling issue in the sidebar component",
          quadrant: "urgent-not-important",
          status: "pending",
          priority: 2,
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // In 4 days
          estimatedTime: 30,
          color: "#f4a261",
          icon: "code"
        });
        
        await this.createActivity({
          userId,
          title: "Browse tech news",
          description: "Read latest articles on tech trends",
          quadrant: "not-urgent-not-important",
          status: "pending",
          priority: 1,
          dueDate: null,
          estimatedTime: 30,
          color: "#a8dadc",
          icon: "newspaper"
        });
        
        await this.createActivity({
          userId,
          title: "Organize digital files",
          description: "Clean up downloads folder and reorganize documents",
          quadrant: "not-urgent-not-important",
          status: "pending",
          priority: 2,
          dueDate: null,
          estimatedTime: 60,
          color: "#a8dadc",
          icon: "folder"
        });
        
        // Create tags based on principles
        const principles = await this.getPrinciplesByUserId(userId);
        for (const principle of principles) {
          await this.createTag({
            userId,
            name: principle.title,
            color: principle.color,
            category: "principle"
          });
        }
        
        // Create tags based on goals
        const goals = await this.getGoalsByUserId(userId);
        for (const goal of goals) {
          await this.createTag({
            userId,
            name: goal.title,
            color: goal.color || "#4361EE",
            category: "goal"
          });
        }
        
        // Add some custom tags
        const customTags = [
          { name: "Work", color: "#ff7b00" },
          { name: "Personal", color: "#6a4c93" },
          { name: "Health", color: "#06d6a0" },
          { name: "Learning", color: "#118ab2" },
          { name: "Social", color: "#ef476f" }
        ];
        
        for (const tagInfo of customTags) {
          await this.createTag({
            userId,
            name: tagInfo.name,
            color: tagInfo.color,
            category: "custom"
          });
        }
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  }
}

// Use database storage
export const storage = new DatabaseStorage();
