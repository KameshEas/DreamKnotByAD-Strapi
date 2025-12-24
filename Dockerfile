FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy the rest of the app
COPY . .

# Build Strapi admin
RUN npm run build

# Expose Strapi port
EXPOSE 1337

# Start Strapi
CMD ["npm", "run", "start"]
