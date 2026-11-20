FROM node:22-alpine AS builder

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY index.html vite.config.js ./
COPY Font ./Font
COPY public ./public
COPY src ./src

ARG VITE_RAZORPAY_KEY_ID
ARG VITE_API_URL
ENV VITE_RAZORPAY_KEY_ID=${VITE_RAZORPAY_KEY_ID}
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:alpine AS runtime

COPY --from=builder /opt/app/dist /usr/share/nginx/html
COPY nginx-main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Root permissions to configure files and temp directories for unprivileged user
RUN chown -R nginx:nginx /usr/share/nginx/html /etc/nginx /var/cache/nginx /var/log/nginx \
    && chmod -R 755 /usr/share/nginx/html \
    && nginx -t && rm -rf /tmp/*

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
