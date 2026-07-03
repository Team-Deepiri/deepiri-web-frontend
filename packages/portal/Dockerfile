FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock tsconfig.json ./
COPY packages/shared ./packages/shared
COPY packages/portal ./packages/portal
RUN yarn install --frozen-lockfile
WORKDIR /app/packages/portal
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/packages/portal/dist /usr/share/nginx/html
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
