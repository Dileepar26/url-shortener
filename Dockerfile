# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only package files for faster builds
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon globally for development
RUN npm install -g nodemon

# Expose the application port
EXPOSE 3000

# Start with nodemon for hot-reloading
CMD ["npx", "nodemon", "app.js"]
