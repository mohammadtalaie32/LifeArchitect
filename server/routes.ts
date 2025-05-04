import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPrincipleSchema, 
  insertGoalSchema, 
  insertProjectSchema,
  insertHabitSchema,
  insertHabitEntrySchema,
  insertJournalEntrySchema,
  insertMoodEntrySchema,
  insertEventSchema,
  insertActivitySchema,
  insertTagSchema,
  insertActivityTagSchema,
  insertUserSettingsSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

// Create session store
const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with sample data
  await storage.initializeData();
  
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "life-architect-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 86400000 // 24 hours
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // Prune expired entries every 24h
      })
    })
  );
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    
    res.status(401).json({ message: "Unauthorized" });
  };
  
  // Auth routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        
        return res.status(201).json(user);
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/user", (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Health check endpoint for container monitoring
  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    });
  });

  // Get current date in ISO format for easier date comparison
  app.get("/api/current-date", (req, res) => {
    res.json({ date: new Date().toISOString() });
  });
  
  // Principles routes
  app.get("/api/principles", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const principles = await storage.getPrinciplesByUserId(userId);
    res.json(principles);
  });
  
  app.post("/api/principles", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const principleData = insertPrincipleSchema.parse({ ...req.body, userId });
      const principle = await storage.createPrinciple(principleData);
      res.status(201).json(principle);
    } catch (error) {
      res.status(400).json({ message: "Invalid principle data", error });
    }
  });
  
  app.put("/api/principles/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    try {
      const principle = await storage.updatePrinciple(id, req.body);
      
      if (!principle) {
        return res.status(404).json({ message: "Principle not found" });
      }
      
      if (principle.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this principle" });
      }
      
      res.json(principle);
    } catch (error) {
      res.status(400).json({ message: "Invalid principle data", error });
    }
  });
  
  app.delete("/api/principles/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await storage.deletePrinciple(id);
    
    if (!result) {
      return res.status(404).json({ message: "Principle not found" });
    }
    
    res.json({ message: "Principle deleted successfully" });
  });
  
  // Goals routes
  app.get("/api/goals", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const goals = await storage.getGoalsByUserId(userId);
    res.json(goals);
  });
  
  app.get("/api/goals/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const goal = await storage.getGoalById(id);
    
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    
    const userId = (req.user as any).id;
    if (goal.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to view this goal" });
    }
    
    res.json(goal);
  });
  
  app.post("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const goalData = insertGoalSchema.parse({ ...req.body, userId });
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data", error });
    }
  });
  
  app.put("/api/goals/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    const goal = await storage.getGoalById(id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    
    if (goal.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this goal" });
    }
    
    try {
      const updatedGoal = await storage.updateGoal(id, req.body);
      res.json(updatedGoal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data", error });
    }
  });
  
  app.delete("/api/goals/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const goal = await storage.getGoalById(id);
    
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    
    const userId = (req.user as any).id;
    if (goal.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this goal" });
    }
    
    const result = await storage.deleteGoal(id);
    res.json({ message: "Goal deleted successfully" });
  });
  
  // Habits routes
  app.get("/api/habits", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const habits = await storage.getHabitsByUserId(userId);
    res.json(habits);
  });
  
  app.get("/api/habits/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const habit = await storage.getHabitById(id);
    
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    const userId = (req.user as any).id;
    if (habit.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to view this habit" });
    }
    
    res.json(habit);
  });
  
  app.post("/api/habits", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const habitData = insertHabitSchema.parse({ ...req.body, userId });
      const habit = await storage.createHabit(habitData);
      res.status(201).json(habit);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit data", error });
    }
  });
  
  app.put("/api/habits/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    const habit = await storage.getHabitById(id);
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    if (habit.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this habit" });
    }
    
    try {
      const updatedHabit = await storage.updateHabit(id, req.body);
      res.json(updatedHabit);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit data", error });
    }
  });
  
  app.delete("/api/habits/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const habit = await storage.getHabitById(id);
    
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    const userId = (req.user as any).id;
    if (habit.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this habit" });
    }
    
    const result = await storage.deleteHabit(id);
    res.json({ message: "Habit deleted successfully" });
  });
  
  // Habit Entries routes
  app.get("/api/habit-entries", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const entries = await storage.getHabitEntriesByUserId(userId, date);
    res.json(entries);
  });
  
  app.get("/api/habits/:habitId/entries", isAuthenticated, async (req, res) => {
    const habitId = parseInt(req.params.habitId);
    const habit = await storage.getHabitById(habitId);
    
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    
    const userId = (req.user as any).id;
    if (habit.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to view entries for this habit" });
    }
    
    const entries = await storage.getHabitEntriesByHabitId(habitId);
    res.json(entries);
  });
  
  app.post("/api/habit-entries", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const entryData = insertHabitEntrySchema.parse({ ...req.body, userId });
      
      // Check if the habit belongs to the user
      const habit = await storage.getHabitById(entryData.habitId);
      if (!habit || habit.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to create an entry for this habit" });
      }
      
      const entry = await storage.createHabitEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit entry data", error });
    }
  });
  
  app.delete("/api/habit-entries/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await storage.deleteHabitEntry(id);
    
    if (!result) {
      return res.status(404).json({ message: "Habit entry not found" });
    }
    
    res.json({ message: "Habit entry deleted successfully" });
  });
  
  // Journal Entries routes
  app.get("/api/journal-entries", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const entries = await storage.getJournalEntriesByUserId(userId);
    res.json(entries);
  });
  
  app.get("/api/journal-entries/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const entry = await storage.getJournalEntryById(id);
    
    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    
    const userId = (req.user as any).id;
    if (entry.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to view this journal entry" });
    }
    
    res.json(entry);
  });
  
  app.post("/api/journal-entries", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const entryData = insertJournalEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createJournalEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid journal entry data", error });
    }
  });
  
  app.put("/api/journal-entries/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    const entry = await storage.getJournalEntryById(id);
    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    
    if (entry.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this journal entry" });
    }
    
    try {
      const updatedEntry = await storage.updateJournalEntry(id, req.body);
      res.json(updatedEntry);
    } catch (error) {
      res.status(400).json({ message: "Invalid journal entry data", error });
    }
  });
  
  app.delete("/api/journal-entries/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const entry = await storage.getJournalEntryById(id);
    
    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    
    const userId = (req.user as any).id;
    if (entry.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this journal entry" });
    }
    
    const result = await storage.deleteJournalEntry(id);
    res.json({ message: "Journal entry deleted successfully" });
  });
  
  // Mood Entries routes
  app.get("/api/mood-entries", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const entries = await storage.getMoodEntriesByUserId(userId, startDate, endDate);
    res.json(entries);
  });
  
  app.post("/api/mood-entries", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const entryData = insertMoodEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createMoodEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid mood entry data", error });
    }
  });
  
  // Events routes
  app.get("/api/events", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const events = await storage.getEventsByUserId(userId, startDate, endDate);
    res.json(events);
  });
  
  app.get("/api/events/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const event = await storage.getEventById(id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    const userId = (req.user as any).id;
    if (event.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to view this event" });
    }
    
    res.json(event);
  });
  
  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const eventData = insertEventSchema.parse({ ...req.body, userId });
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data", error });
    }
  });
  
  app.put("/api/events/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    const event = await storage.getEventById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    if (event.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this event" });
    }
    
    try {
      const updatedEvent = await storage.updateEvent(id, req.body);
      res.json(updatedEvent);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data", error });
    }
  });
  
  app.delete("/api/events/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const event = await storage.getEventById(id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    const userId = (req.user as any).id;
    if (event.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }
    
    const result = await storage.deleteEvent(id);
    res.json({ message: "Event deleted successfully" });
  });
  
  // Activities routes
  app.get("/api/activities", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const activities = await storage.getActivitiesByUserId(userId);
    res.json(activities);
  });

  app.get("/api/activities/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const activity = await storage.getActivityById(id);
    
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    
    const userId = (req.user as any).id;
    if (activity.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to view this activity" });
    }
    
    res.json(activity);
  });

  app.post("/api/activities", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const activityData = insertActivitySchema.parse({ ...req.body, userId });
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data", error });
    }
  });

  app.put("/api/activities/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    const activity = await storage.getActivityById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    
    if (activity.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this activity" });
    }
    
    try {
      const updatedActivity = await storage.updateActivity(id, req.body);
      res.json(updatedActivity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data", error });
    }
  });

  app.delete("/api/activities/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const activity = await storage.getActivityById(id);
    
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    
    const userId = (req.user as any).id;
    if (activity.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this activity" });
    }
    
    const result = await storage.deleteActivity(id);
    res.json({ message: "Activity deleted successfully" });
  });

  // Tags routes
  app.get("/api/tags", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const tags = await storage.getTagsByUserId(userId);
    res.json(tags);
  });

  app.post("/api/tags", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const tagData = insertTagSchema.parse({ ...req.body, userId });
      const tag = await storage.createTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      res.status(400).json({ message: "Invalid tag data", error });
    }
  });

  app.put("/api/tags/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    const tag = await storage.getTagById(id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    
    if (tag.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to update this tag" });
    }
    
    try {
      const updatedTag = await storage.updateTag(id, req.body);
      res.json(updatedTag);
    } catch (error) {
      res.status(400).json({ message: "Invalid tag data", error });
    }
  });

  app.delete("/api/tags/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const tag = await storage.getTagById(id);
    
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    
    const userId = (req.user as any).id;
    if (tag.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this tag" });
    }
    
    const result = await storage.deleteTag(id);
    res.json({ message: "Tag deleted successfully" });
  });

  // Activity Tags routes
  app.get("/api/activities/:activityId/tags", isAuthenticated, async (req, res) => {
    const activityId = parseInt(req.params.activityId);
    const activity = await storage.getActivityById(activityId);
    
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    
    const userId = (req.user as any).id;
    if (activity.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to view tags for this activity" });
    }
    
    const activityTags = await storage.getActivityTagsByActivityId(activityId);
    res.json(activityTags);
  });

  app.post("/api/activity-tags", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { activityId, tagId } = req.body;
      
      // Check if the activity belongs to the user
      const activity = await storage.getActivityById(activityId);
      if (!activity || activity.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to tag this activity" });
      }
      
      // Check if the tag belongs to the user
      const tag = await storage.getTagById(tagId);
      if (!tag || tag.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to use this tag" });
      }
      
      const activityTag = await storage.createActivityTag({ activityId, tagId });
      res.status(201).json(activityTag);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity tag data", error });
    }
  });

  app.delete("/api/activity-tags/:activityId/:tagId", isAuthenticated, async (req, res) => {
    const activityId = parseInt(req.params.activityId);
    const tagId = parseInt(req.params.tagId);
    const userId = (req.user as any).id;
    
    // Check if the activity belongs to the user
    const activity = await storage.getActivityById(activityId);
    if (!activity || activity.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to untag this activity" });
    }
    
    const result = await storage.deleteActivityTag(activityId, tagId);
    res.json({ message: "Activity tag removed successfully" });
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // User Settings routes
  app.get("/api/user/settings", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const settings = await storage.getUserSettings(userId);
    res.json(settings);
  });
  
  app.get("/api/user/settings/:moduleName", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).id;
    const moduleName = req.params.moduleName;
    const setting = await storage.getUserSettingByModule(userId, moduleName);
    
    if (!setting) {
      return res.status(404).json({ message: "Setting not found for this module" });
    }
    
    res.json(setting);
  });
  
  app.post("/api/user/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const settingData = insertUserSettingsSchema.parse({ ...req.body, userId });
      const setting = await storage.createUserSetting(settingData);
      res.status(201).json(setting);
    } catch (error) {
      res.status(400).json({ message: "Invalid user setting data", error });
    }
  });
  
  app.patch("/api/user/settings/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Validate that the setting belongs to the current user
    const allSettings = await storage.getUserSettings(userId);
    const userSetting = allSettings.find(setting => setting.id === id);
    
    if (!userSetting) {
      return res.status(404).json({ message: "Setting not found or does not belong to user" });
    }
    
    try {
      const updatedSetting = await storage.updateUserSetting(id, req.body);
      res.json(updatedSetting);
    } catch (error) {
      res.status(400).json({ message: "Invalid user setting data", error });
    }
  });
  
  app.delete("/api/user/settings/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Validate that the setting belongs to the current user
    const allSettings = await storage.getUserSettings(userId);
    const userSetting = allSettings.find(setting => setting.id === id);
    
    if (!userSetting) {
      return res.status(404).json({ message: "Setting not found or does not belong to user" });
    }
    
    const result = await storage.deleteUserSetting(id);
    res.json({ message: "User setting deleted successfully" });
  });

  return httpServer;
}
