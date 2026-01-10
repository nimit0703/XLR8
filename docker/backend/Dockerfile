FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy project
COPY apps/backend ./apps/backend
COPY apps/frontend ./apps/frontend

# Install and build frontend
WORKDIR /app/apps/frontend
RUN pnpm install
RUN pnpm run build

# Install backend
WORKDIR /app/apps/backend
RUN pnpm install

EXPOSE 3001

# IMPORTANT: Run the backend server, NOT docker-compose
WORKDIR /app/apps/backend
CMD ["pnpm", "run", "dev"]