FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy db package
COPY apps/db ./apps/db

# Install dependencies
WORKDIR /app/apps/db
RUN pnpm install

# Generate Prisma client
RUN npx prisma generate

WORKDIR /app/apps/db