# ==========================================
# Stage 1: Build (discarded after build)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Build static bundle
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Production (ONLY dist + nginx)
# Size: ~25MB total | RAM: ~6MB | CPU: ~0%
# ==========================================
FROM nginx:alpine-slim

# Copy compiled dist folder only
COPY --from=builder /app/dist /usr/share/nginx/html

# Lightweight Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
