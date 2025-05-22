FROM node:22.1.0 AS builder

WORKDIR /app

COPY shared ./shared

WORKDIR /app/shared

RUN npm ci && npm run build


WORKDIR /app

COPY api/package.json api/package-lock.json api/tsconfig.json ./api/

WORKDIR /app/api

RUN npm ci

COPY api/src ./src

RUN npm run build


FROM node:22.1.0-alpine

WORKDIR /app

RUN apk add --no-cache python3 make

COPY api/package.json api/package-lock.json ./

RUN npm install --omit=dev

COPY --from=builder /app/api/build ./build

RUN mkdir -p /app/data

EXPOSE 8000

CMD ["node", "build/api/src/server.js"]
