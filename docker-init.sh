#!/bin/bash
set -e

# Wait for the database to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Run the database migrations
echo "Running database migrations..."
npm run db:push

# Initialize development data
echo "Initializing development data..."
node scripts/init-data.js

# Start the application
echo "Starting the application..."
npm run dev