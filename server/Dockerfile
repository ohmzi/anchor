FROM node:24-alpine

# Install pnpm
RUN npm install -g pnpm

# Workdir
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Set a default DATABASE_URL for build-time Prisma generation.
# This will be overridden by the runtime environment in docker-compose.
ENV DATABASE_URL=postgresql://anchor:password@postgres:5432/anchor

# Generate Prisma Client
RUN pnpm prisma generate

# Build the app
RUN pnpm build

# Expose ports
EXPOSE 3000

# Start command
# We use a shell to run migrations before starting the app
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
