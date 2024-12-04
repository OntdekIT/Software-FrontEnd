# ---- Base Node ----
    FROM node:21 AS base
    ENV APP_PATH=app/climatechecker/client
    
    # ---- Dependencies ----
    FROM base AS dependencies
    WORKDIR /${APP_PATH}
    
    # Copy package.json which contains information about the dependencies we need
    COPY package*.json ./
    
    # Install dependencies
    RUN npm ci
    
    # ---- Build Stage ----
    FROM base AS build
    WORKDIR /${APP_PATH}
    
    # Copy dependencies from the dependencies stage
    COPY --from=dependencies /${APP_PATH}/ ./
    
    # Copy index.html file from the root
    COPY index.html . 

    # Copy only the necessary sources
    WORKDIR /${APP_PATH}/public
    COPY public/ ./
    WORKDIR /${APP_PATH}/src
    COPY src/ ./
    
    # Build the application for production
    RUN npm run build
    
    # ---- Release with NGINX ----
    FROM nginx:alpine AS release
    ENV APP_PATH=app/climatechecker/client
    
    # Copy the built React app to NGINX's public folder
    WORKDIR /usr/share/nginx/html
    COPY --from=build /${APP_PATH}/dist ./
    
    # Expose port 80
    EXPOSE 80
    
    # Use CMD to start NGINX instead of ENTRYPOINT
    CMD ["nginx", "-g", "daemon off;"]
    
    # To run, use the following command:
    # sudo docker run -p 3000:80 --name mynginx ontdekstation-client-release:latest
    