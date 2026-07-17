FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock tsconfig.json ./
COPY packages/shared ./packages/shared
COPY packages/immersive ./packages/immersive
RUN yarn install --frozen-lockfile
WORKDIR /app/packages/immersive
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/packages/immersive/dist /usr/share/nginx/html
EXPOSE 5174
CMD ["nginx", "-g", "daemon off;"]
