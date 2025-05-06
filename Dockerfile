# syntax=docker/dockerfile:1

# This Dockerfile is built in three steps to keep things small and secure:
# First step (deps):
# - Install dependencies
# - Create a clean layer for dependencies

# Second step (builder):
# - The app is built and database tools are created
# - Code quality checks are enforced (linting and types)

# Third step (runtime):
# - Only needed files are taken from previous steps

# Dependencies stage
FROM node:22-alpine@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd AS deps

WORKDIR /var/task

# Install dependencies with specific flags for security:
# --audit=false : Skip the dependency vulnerability check (we do this in CI)
# --fund=false : Skip funding messages and requests
# --loglevel=error : Show only error messages to avoid exposing system info
COPY package*.json ./
RUN npm ci --audit=false --fund=false --loglevel=error

# Build stage
FROM node:22-alpine@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd AS builder

WORKDIR /var/task

# Set env vars
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SHARP_PATH=/var/task/node_modules/sharp
ENV DOCKER_BUILD=true

# Copy dependencies from deps stage
COPY --from=deps /var/task/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma client (this does not need a real DB connection)
RUN npx prisma generate

# Build Next.js app (with full type checking and linting)
RUN npx next build

# Runtime stage
FROM node:22-alpine@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd AS runtime

WORKDIR /var/task

# Set production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000

RUN chown -R node:node /var/task

# Copy only the necessary files
COPY --from=builder /var/task/next.config.js ./
COPY --from=builder /var/task/public ./public
COPY --from=builder /var/task/.next/standalone ./
COPY --from=builder /var/task/.next/static ./.next/static
COPY --from=builder /var/task/prisma ./prisma
COPY --from=builder /var/task/node_modules/.prisma ./node_modules/.prisma

# Add Lambda Web Adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

USER node

EXPOSE ${PORT}

# Start the application
CMD ["node", "server.js"]
