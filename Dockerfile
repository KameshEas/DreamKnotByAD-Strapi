FROM node:20-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first (better caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Build Strapi admin
RUN npm run build

EXPOSE 1337

CMD ["npm", "run", "start"]
