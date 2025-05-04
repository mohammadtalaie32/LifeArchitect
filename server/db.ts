import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Check if database URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create database connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create drizzle instance with schema
export const db = drizzle(pool, { schema });