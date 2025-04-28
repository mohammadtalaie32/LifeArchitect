FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Make the initialization script executable
RUN chmod +x docker-init.sh

# Expose the port
EXPOSE 5000

# Start the application using the initialization script
CMD ["./docker-init.sh"]