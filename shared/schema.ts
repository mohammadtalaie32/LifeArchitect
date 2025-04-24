import { pgTable, text, serial, integer, boolean, date, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// Core Principles Schema
export const principles = pgTable("principles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
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
  userId: integer("user_id").notNull(),
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
  userId: integer("user_id").notNull(),
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
  userId: integer("user_id").notNull(),
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
  habitId: integer("habit_id").notNull(),
  userId: integer("user_id").notNull(),
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
  userId: integer("user_id").notNull(),
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
  userId: integer("user_id").notNull(),
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
  userId: integer("user_id").notNull(),
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

// Type Exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

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
