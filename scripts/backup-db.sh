#!/bin/bash
set -e

# This script creates a backup of the PostgreSQL database
# It can be run as a cron job or manually

# Get current date and time for the backup file name
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
BACKUP_FILE="$BACKUP_DIR/life_architect_backup_$TIMESTAMP.sql"

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# Parse DATABASE_URL for connection parameters
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set."
  exit 1
fi

# Extract connection details from DATABASE_URL
# Format: postgres://username:password@hostname:port/database
if [[ $DATABASE_URL =~ postgres://([^:]+):([^@]+)@([^:]+):([0-9]+)/([^\\?]+) ]]; then
  DB_USER="${BASH_REMATCH[1]}"
  DB_PASS="${BASH_REMATCH[2]}"
  DB_HOST="${BASH_REMATCH[3]}"
  DB_PORT="${BASH_REMATCH[4]}"
  DB_NAME="${BASH_REMATCH[5]}"
else
  echo "ERROR: Failed to parse DATABASE_URL"
  exit 1
fi

# Set PGPASSWORD environment variable to avoid password prompt
export PGPASSWORD="$DB_PASS"

echo "Creating database backup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F p > "$BACKUP_FILE"

# Check if the backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_FILE"
  
  # Compress the backup to save space
  gzip "$BACKUP_FILE"
  echo "Backup compressed: $BACKUP_FILE.gz"
  
  # Remove backups older than 7 days
  find "$BACKUP_DIR" -name "*.gz" -type f -mtime +7 -delete
  echo "Old backups removed."
else
  echo "ERROR: Backup failed!"
  exit 1
fi

# Clear PGPASSWORD for security
unset PGPASSWORD