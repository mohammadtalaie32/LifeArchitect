#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
./scripts/wait-for-db.sh

# Run database migrations
echo "Running database migrations..."
npm run db:push

# Initialize sample data if needed
if [[ "$INIT_SAMPLE_DATA" == "true" ]]; then
  echo "Initializing sample data..."
  npx tsx scripts/init-data.ts
fi

# Start the application
echo "Starting the application..."
npm run dev