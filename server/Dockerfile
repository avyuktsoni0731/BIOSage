# Use official Node.js LTS image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your code
COPY . .

# Expose the port your app runs on
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
