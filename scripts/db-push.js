// Database migration script for production environment
// This script pushes the schema to the database

// Import required modules
const { execSync } = require('child_process');

try {
  console.log('Starting database migration...');
  
  // Execute drizzle-kit push command
  execSync('npx drizzle-kit push', { 
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('Database migration completed successfully!');
} catch (error) {
  console.error('Database migration failed:', error.message);
  process.exit(1);
}