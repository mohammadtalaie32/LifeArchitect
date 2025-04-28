#!/bin/bash
set -e

# This script restores a PostgreSQL database from a backup
# Usage: ./restore-db.sh path/to/backup.sql.gz

# Check if backup file was provided
if [ -z "$1" ]; then
  echo "ERROR: No backup file specified."
  echo "Usage: $0 path/to/backup.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

# Check if the backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file does not exist: $BACKUP_FILE"
  exit 1
fi

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

# Ask for confirmation before proceeding
echo "WARNING: This will overwrite the current database ($DB_NAME) with data from the backup."
read -p "Are you sure you want to continue? (y/n): " confirm
if [ "$confirm" != "y" ]; then
  echo "Restore canceled."
  exit 0
fi

echo "Preparing to restore database from $BACKUP_FILE..."

# Check if the backup is compressed (ends with .gz)
if [[ "$BACKUP_FILE" == *.gz ]]; then
  # Decompress backup file first
  echo "Decompressing backup file..."
  TEMP_FILE=$(mktemp)
  gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
  BACKUP_FILE="$TEMP_FILE"
  echo "Backup decompressed."
fi

# Drop and recreate the database
echo "Dropping existing database..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
echo "Creating fresh database..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"
echo "Database recreated."

# Restore the database
echo "Restoring database from backup..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"

# Check if restore was successful
if [ $? -eq 0 ]; then
  echo "Database restore completed successfully!"
else
  echo "ERROR: Database restore failed!"
  exit 1
fi

# Clean up temporary file if we decompressed
if [ -n "$TEMP_FILE" ]; then
  rm "$TEMP_FILE"
fi

# Clear PGPASSWORD for security
unset PGPASSWORD