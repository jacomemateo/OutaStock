# ---- Build Stage ----
ARG NODE_VERSION=24.14.0-alpine
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source
COPY . .

# Build production bundle
RUN npm run build

# ---- Production Stage ----
# We use the official Caddy image now
FROM caddy:2-alpine AS runner

WORKDIR /app

# Copy build output
COPY --from=builder /app/dist ./dist

# Copy the internal Caddyfile
COPY Caddyfile .

# Copy entrypoint script
COPY entrypoint.sh .

# Make sure entrypoint is executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

# Run entrypoint (injects env vars) then starts Caddy
ENTRYPOINT ["sh", "./entrypoint.sh"]
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]