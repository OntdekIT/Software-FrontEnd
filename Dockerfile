# ---- Base Node ----
FROM node:22.12.0 AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS dependencies
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# ---- Build Stage ----
FROM base AS build
WORKDIR /app

# Copy dependencies from the dependencies stage
COPY --from=dependencies /app/ ./

# CRITICAL FIX 1: Copy ALL files so vite.config.js is included
COPY . .

# CRITICAL FIX 2: Catch the backend URL from docker-compose and expose it to Vite
ARG VITE_BACKEND_API_URL
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL

# Build the application for production
RUN npm run build:docker

# ---- Release with NGINX ----
FROM nginx:alpine AS release
WORKDIR /usr/share/nginx/html

# Copy the built React app to NGINX's public folder
COPY --from=build /app/dist ./

# Expose port 80
EXPOSE 80

# Use CMD to start NGINX
CMD ["nginx", "-g", "daemon off;"]

# ---- Dev Stage ----
FROM base AS dev
WORKDIR /app
COPY --from=dependencies /app/ ./
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]