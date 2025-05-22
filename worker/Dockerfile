FROM node:22.1.0 AS builder

WORKDIR /app

COPY shared ./shared

WORKDIR /app/shared

RUN npm ci && npm run build


WORKDIR /app

COPY worker/package.json worker/package-lock.json worker/tsconfig.json ./worker/

WORKDIR /app/worker

RUN npm ci

COPY worker/src ./src

RUN npm run build


FROM node:22.1.0-alpine

WORKDIR /app

RUN apk add --no-cache python3 make

COPY worker/package.json worker/package-lock.json ./

RUN npm install --omit=dev

COPY --from=builder /app/worker/build ./build

CMD ["node", "build/worker/src/worker.js"]
