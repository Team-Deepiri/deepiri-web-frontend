FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock tsconfig.json ./
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server
RUN yarn install --frozen-lockfile

RUN cd /app/packages/shared && npx tsc && ls dist
RUN echo '{"name":"@deepiri/shared","version":"1.0.0","main":"dist/src/index.js","types":"src/index.ts"}' > /app/packages/shared/package.json

WORKDIR /app/packages/server
RUN yarn build
RUN mkdir -p dist/packages/server/src/config && cp src/config/serviceRegistry.json dist/packages/server/src/config/serviceRegistry.json
EXPOSE 5200
CMD ["node", "dist/packages/server/src/index.js"]
