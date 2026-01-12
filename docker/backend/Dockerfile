FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm@10.28.0

WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json ./

# Copy all package.json files to leverage Docker cache
COPY apps/db/package.json apps/db/
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

# Install all workspace dependencies
RUN pnpm install

# Copy the actual source code
COPY apps/db apps/db
COPY apps/backend apps/backend  
COPY apps/frontend apps/frontend

# Generate Prisma Client
RUN cd apps/db && pnpm run generate


# Build frontend
RUN cd apps/frontend && pnpm run build

# Expose backend port
EXPOSE 3001

# Set working directory and start
WORKDIR /app/apps/backend
CMD ["pnpm", "run", "dev"]