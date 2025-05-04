import { pgTable, text, serial, integer, boolean, date, timestamp, jsonb, primaryKey, varchar, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Modules Schema
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon"),
  isSystem: boolean("is_system").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  defaultSettings: jsonb("default_settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;

export const insertModuleSchema = createInsertSchema(modules).pick({
  name: true,
  description: true,
  icon: true,
  isSystem: true,
  displayOrder: true,
  defaultSettings: true,
});

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
});

// User Settings Schema
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(true),
  displayOrder: integer("display_order").default(0),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    uniqueUserModule: unique().on(table.userId, table.moduleId),
  };
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  userId: true,
  moduleId: true,
  enabled: true,
  displayOrder: true,
  settings: true,
});

// Core Principles Schema
export const principles = pgTable("principles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  order: integer("order").notNull(),
});

export const insertPrincipleSchema = createInsertSchema(principles).pick({
  userId: true,
  title: true,
  description: true,
  color: true,
  order: true,
});

// Goals Schema
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: date("target_date"),
  completed: boolean("completed").default(false),
  progress: integer("progress").default(0),
  totalSteps: integer("total_steps").default(1),
  color: text("color"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  title: true,
  description: true,
  targetDate: true,
  completed: true,
  progress: true,
  totalSteps: true,
  color: true,
  category: true,
});

// Passions & Projects Schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  status: text("status").default("active"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  userId: true,
  title: true,
  description: true,
  category: true,
  status: true,
  startDate: true,
  endDate: true,
});

// Habits & Rituals Schema
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull(), // daily, weekly, etc.
  timeOfDay: text("time_of_day"),
  createdAt: timestamp("created_at").defaultNow(),
  streak: integer("streak").default(0),
  bestStreak: integer("best_streak").default(0),
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  userId: true,
  title: true,
  description: true,
  frequency: true,
  timeOfDay: true,
  streak: true,
  bestStreak: true,
});

// Habit Tracking Schema
export const habitEntries = pgTable("habit_entries", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  completed: boolean("completed").default(true),
  completedAt: timestamp("completed_at").defaultNow(),
  notes: text("notes"),
});

export const insertHabitEntrySchema = createInsertSchema(habitEntries).pick({
  habitId: true,
  userId: true,
  completed: true,
  completedAt: true,
  notes: true,
});

// Journal Entries Schema
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  title: true,
  content: true,
  mood: true,
  tags: true,
});

// Mood Tracking Schema
export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mood: text("mood").notNull(), // positive, neutral, negative
  intensityLevel: integer("intensity_level").default(3), // 1-5 scale
  factors: jsonb("factors"), // JSON array of factors affecting mood
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).pick({
  userId: true,
  mood: true,
  intensityLevel: true,
  factors: true,
  notes: true,
});

// Social Interactions & Events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  category: text("category"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).pick({
  userId: true,
  title: true,
  description: true,
  location: true,
  startTime: true,
  endTime: true,
  category: true,
  icon: true,
});

// Eisenhower Matrix Activities Schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  quadrant: text("quadrant").notNull(), // "urgent-important", "not-urgent-important", "urgent-not-important", "not-urgent-not-important"
  status: text("status").default("pending"), // "pending", "in-progress", "completed", "cancelled"
  priority: integer("priority").default(0), // A numerical value for ordering within quadrants
  dueDate: timestamp("due_date"),
  estimatedTime: integer("estimated_time"), // in minutes
  actualTime: integer("actual_time"), // in minutes
  color: text("color"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  title: true,
  description: true,
  quadrant: true,
  status: true,
  priority: true,
  dueDate: true,
  estimatedTime: true,
  actualTime: true,
  color: true,
  icon: true,
  completedAt: true,
});

// Tags for activities - These can be principles, goals, or custom tags
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color"),
  category: text("category"), // "principle", "goal", "custom"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTagSchema = createInsertSchema(tags).pick({
  userId: true,
  name: true,
  color: true,
  category: true,
});

// Activity-Tag many-to-many relationship
export const activityTags = pgTable("activity_tags", {
  activityId: integer("activity_id").notNull().references(() => activities.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  principleId: integer("principle_id").references(() => principles.id, { onDelete: "set null" }),
  goalId: integer("goal_id").references(() => goals.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.activityId, t.tagId] }),
}));

export const insertActivityTagSchema = createInsertSchema(activityTags).pick({
  activityId: true,
  tagId: true,
  principleId: true,
  goalId: true,
});

// Type Exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

export type Principle = typeof principles.$inferSelect;
export type InsertPrinciple = z.infer<typeof insertPrincipleSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

export type HabitEntry = typeof habitEntries.$inferSelect;
export type InsertHabitEntry = z.infer<typeof insertHabitEntrySchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type ActivityTag = typeof activityTags.$inferSelect;
export type InsertActivityTag = z.infer<typeof insertActivityTagSchema>;