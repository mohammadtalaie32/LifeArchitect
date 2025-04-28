#!/bin/bash
set -e

# This script is used for health checking the application in a container environment
# It makes a simple HTTP request to the application's health endpoint

APP_HOST="${HOST:-localhost}"
APP_PORT="${PORT:-5000}"
ENDPOINT="/api/health"

# Construct the URL
URL="http://${APP_HOST}:${APP_PORT}${ENDPOINT}"

echo "Checking application health at: $URL"

# Use curl to make the request with a 5 second timeout
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$URL")

# Check the response status code
if [ "$response" -eq 200 ]; then
  echo "Health check successful (HTTP $response)"
  exit 0
else
  echo "Health check failed (HTTP $response)"
  exit 1
fi