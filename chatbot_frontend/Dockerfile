# Frontend Dockerfile
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Build the React app
COPY . .
RUN npm run build

# Use nginx to serve the frontend
FROM nginx:stable-alpine
COPY --from=0 /usr/src/app/build /usr/share/nginx/html

# Expose the frontend port
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
