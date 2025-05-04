import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { modules } from '../shared/schema.js';

const modulesData = [
  {
    name: "Dashboard",
    description: "Overview of your personal development journey",
    icon: "LayoutDashboard",
    isSystem: true,
    displayOrder: 1,
    defaultSettings: {}
  },
  {
    name: "Core Principles",
    description: "Define your core values and guiding principles",
    icon: "Heart",
    isSystem: true,
    displayOrder: 2,
    defaultSettings: {}
  },
  {
    name: "Goals",
    description: "Track and manage your short and long-term goals",
    icon: "Target",
    isSystem: true,
    displayOrder: 3,
    defaultSettings: {}
  },
  {
    name: "Passions & Projects",
    description: "Manage complex projects with multiple tasks",
    icon: "FolderGit2",
    isSystem: true,
    displayOrder: 4,
    defaultSettings: {}
  },
  {
    name: "Habits & Rituals",
    description: "Build and maintain positive daily routines",
    icon: "Repeat",
    isSystem: true,
    displayOrder: 5,
    defaultSettings: {}
  },
  {
    name: "Activities",
    description: "Organize tasks using the Eisenhower matrix",
    icon: "ListTodo",
    isSystem: true,
    displayOrder: 6,
    defaultSettings: {}
  },
  {
    name: "Challenges & Solutions",
    description: "Space for identifying challenges and developing solutions",
    icon: "Lightbulb",
    isSystem: true,
    displayOrder: 7,
    defaultSettings: {}
  },
  {
    name: "Self-Analysis (Journal)",
    description: "Document your thoughts and reflections",
    icon: "BookOpen",
    isSystem: true,
    displayOrder: 8,
    defaultSettings: {}
  },
  {
    name: "Analytics",
    description: "Insights and visualizations of your progress",
    icon: "BarChart3",
    isSystem: true,
    displayOrder: 9,
    defaultSettings: {}
  },
  {
    name: "Social Interactions",
    description: "Track and manage social connections and events",
    icon: "Users",
    isSystem: true,
    displayOrder: 10,
    defaultSettings: {}
  },
  {
    name: "Mood",
    description: "Track your emotional well-being over time",
    icon: "Smile",
    isSystem: true,
    displayOrder: 11,
    defaultSettings: {}
  },
  {
    name: "Calendar",
    description: "Plan and visualize your schedule",
    icon: "Calendar",
    isSystem: true,
    displayOrder: 12,
    defaultSettings: {}
  }
];

async function main() {
  try {
    // Create a new pool using the environment variables
    const pool = new Pool({
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'life_architect',
    });

    // Create a Drizzle instance
    const db = drizzle(pool);

    // Insert modules
    console.log('Inserting modules...');
    for (const moduleData of modulesData) {
      try {
        await db.insert(modules).values(moduleData);
        console.log(`Inserted module: ${moduleData.name}`);
      } catch (error: any) {
        if (error.code === '23505') { // Unique violation
          console.log(`Module already exists: ${moduleData.name}`);
        } else {
          console.error(`Error inserting module ${moduleData.name}:`, error);
        }
      }
    }

    console.log('Initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during initialization:', error);
    process.exit(1);
  }
}

main(); 