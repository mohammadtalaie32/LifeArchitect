#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
./scripts/wait-for-db.sh

# Run database migrations
echo "Running database migrations..."
node dist/scripts/db-push.js

# Initialize sample data if needed
if [[ "$INIT_SAMPLE_DATA" == "true" ]]; then
  echo "Initializing sample data..."
  node dist/scripts/init-data.js
fi

# Start the application in production mode
echo "Starting the application in production mode..."
NODE_ENV=production node dist/server/index.js