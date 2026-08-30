# Deepiri Web Frontend — multi-stage Dockerfile
#
#   docker build -t deepiri-frontend:dev .              # default: dev
#   docker build --target prod -t deepiri-frontend:prod .
#
# Dev: load-k8s-env.sh is mounted at runtime via docker-compose (ops/k8s/).

# --- Production build ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/*

COPY src/vite-env.d.ts ./src/
COPY src/declarations.d.ts ./src/
COPY . .

ARG VITE_API_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID

ENV VITE_API_URL=$VITE_API_URL \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
    VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID

RUN npm run build && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/* /root/.npm

# --- Production runtime ---
FROM nginx:alpine AS prod

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# --- Development (Vite HMR) — default when --target is omitted ---
FROM node:20-alpine AS dev

WORKDIR /app

RUN apk add --no-cache inotify-tools bash

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

ENV NODE_ENV=development

EXPOSE 5173

# load-k8s-env.sh is bind-mounted in docker-compose.dev.yml
ENTRYPOINT ["/bin/sh", "-c", "if [ -f /usr/local/bin/load-k8s-env.sh ]; then . /usr/local/bin/load-k8s-env.sh; fi; exec \"$@\"", "--"]
CMD ["npm", "run", "dev:turbo"]
