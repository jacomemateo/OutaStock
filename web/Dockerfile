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
FROM node:${NODE_VERSION} AS runner

ENV NODE_ENV=production
WORKDIR /app

# Copy build output
COPY --from=builder --chown=node:node /app/dist ./dist


# Install serve
RUN --mount=type=cache,target=/root/.npm npm install serve@^14.2.6 --omit=dev

# Copy entrypoint script
COPY entrypoint.sh .
# Make env.js writable
RUN chmod +x /app/entrypoint.sh


USER node
EXPOSE 3000

ENTRYPOINT ["sh", "entrypoint.sh"]
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]