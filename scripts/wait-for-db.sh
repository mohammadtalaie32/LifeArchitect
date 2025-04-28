#!/bin/bash
set -e

MAX_RETRIES=30
RETRY_INTERVAL=2

echo "Checking database connection..."

# Extract connection details from DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

# Parse the DATABASE_URL to get host and port
# Format: postgres://username:password@hostname:port/database
if [[ $DATABASE_URL =~ postgres://[^:]+:[^@]+@([^:]+):([0-9]+)/[^\\?]+ ]]; then
  DB_HOST="${BASH_REMATCH[1]}"
  DB_PORT="${BASH_REMATCH[2]}"
else
  echo "Failed to parse DATABASE_URL: $DATABASE_URL"
  exit 1
fi

echo "Waiting for PostgreSQL to be ready at $DB_HOST:$DB_PORT..."

# Try to connect to PostgreSQL
count=0
while [ $count -lt $MAX_RETRIES ]; do
  count=$((count+1))
  
  # Check if we can connect to PostgreSQL
  if pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo "PostgreSQL is ready!"
    exit 0
  fi
  
  echo "PostgreSQL is not ready yet (attempt $count/$MAX_RETRIES)... waiting $RETRY_INTERVAL seconds"
  sleep $RETRY_INTERVAL
done

echo "Failed to connect to PostgreSQL after $MAX_RETRIES attempts"
exit 1