FROM node:22.1.0

WORKDIR /app

COPY shared/package.json shared/package-lock.json shared/tsconfig.json /app/shared/

WORKDIR /app/shared

RUN npm install

COPY worker/package.json worker/package-lock.json worker/tsconfig.json /app/worker/

WORKDIR /app/worker

RUN npm install

WORKDIR /app/worker

CMD ["npm", "run", "dev"]
