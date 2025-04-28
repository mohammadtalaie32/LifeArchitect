FROM node:20-slim

WORKDIR /app

# Install PostgreSQL client for DB operations
RUN apt-get update && apt-get install -y postgresql-client gzip curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package.json files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Make scripts executable
RUN chmod +x docker-init.sh scripts/wait-for-db.sh scripts/health-check.sh

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=development
ENV PORT=5000

# Start the application
CMD ["./docker-init.sh"]